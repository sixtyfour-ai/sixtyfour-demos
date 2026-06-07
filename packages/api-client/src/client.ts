/**
 * SixtyfourClient — thin fetch wrapper around api.sixtyfour.ai.
 *
 * Design notes:
 * - Uses native `fetch` (Node >=18, Edge, browser). No deps.
 * - Throws `SixtyfourApiError` on non-2xx so callers can branch on status.
 * - Polling lives outside the client (see @sixtyfour-demos/utils) so the
 *   client stays a pure I/O surface.
 * - The client never reads `process.env`. Always pass an explicit apiKey,
 *   so the same code works in Node scripts, Next.js API routes, and tests.
 */

import { SixtyfourApiError } from "./errors";
import type {
  AsyncJobResponse,
  CompanyIntelligenceRequest,
  CompanyIntelligenceResponse,
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  DownloadLinksResponse,
  JobStatusResponse,
  LiveStatusResponse,
  RunWorkflowRequest,
  RunWorkflowResponse,
} from "./types";

export interface SixtyfourClientOptions {
  apiKey: string;
  /** Defaults to https://api.sixtyfour.ai */
  baseUrl?: string;
  /** Optional fetch implementation override (for tests). */
  fetchImpl?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://api.sixtyfour.ai";

export class SixtyfourClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SixtyfourClientOptions) {
    if (!options.apiKey || options.apiKey.length === 0) {
      throw new Error("SixtyfourClient: apiKey is required");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  // -------------------------------------------------------------------------
  // Company Intelligence (direct enrichment — no workflow needed)
  // -------------------------------------------------------------------------

  /** POST /company-intelligence — synchronous single-company enrichment. */
  async companyIntelligence(
    body: CompanyIntelligenceRequest,
  ): Promise<CompanyIntelligenceResponse> {
    return this.request<CompanyIntelligenceResponse>("POST", "/company-intelligence", { body });
  }

  /** POST /company-intelligence-async — returns task_id for long-running enrichments. */
  async companyIntelligenceAsync(
    body: CompanyIntelligenceRequest,
  ): Promise<AsyncJobResponse> {
    return this.request<AsyncJobResponse>("POST", "/company-intelligence-async", { body });
  }

  /** GET /job-status/{task_id} — poll async enrichment jobs. */
  async getJobStatus(taskId: string): Promise<JobStatusResponse> {
    if (!taskId) throw new Error("getJobStatus: taskId is required");
    return this.request<JobStatusResponse>("GET", `/job-status/${encodeURIComponent(taskId)}`);
  }

  // -------------------------------------------------------------------------
  // Workflows
  // -------------------------------------------------------------------------

  /**
   * POST /workflows/create_workflow — create or upsert a workflow.
   *
   * If `id` is provided in the body, repeated calls with the same id
   * idempotently update the workflow. The provisioning script relies on
   * this to be safe to re-run.
   */
  async createWorkflow(body: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    return this.request<CreateWorkflowResponse>("POST", "/workflows/create_workflow", {
      body,
    });
  }

  /**
   * POST /workflows/run?workflow_id=... — kick off a run.
   *
   * The body's `webhook_payload` is the user's input. It can be a single
   * object or an array (Sixtyfour accepts both for webhook-input workflows).
   */
  async runWorkflow(workflowId: string, body: RunWorkflowRequest): Promise<RunWorkflowResponse> {
    if (!workflowId) {
      throw new Error("runWorkflow: workflowId is required");
    }
    return this.request<RunWorkflowResponse>(
      "POST",
      `/workflows/run?workflow_id=${encodeURIComponent(workflowId)}`,
      { body },
    );
  }

  /**
   * GET /workflows/runs/{run_id}/live_status — single status snapshot.
   *
   * Use the `pollWorkflow` helper from @sixtyfour-demos/utils to poll
   * to completion; this method is the building block.
   */
  async getLiveStatus(jobId: string): Promise<LiveStatusResponse> {
    if (!jobId) {
      throw new Error("getLiveStatus: jobId is required");
    }
    return this.request<LiveStatusResponse>(
      "GET",
      `/workflows/runs/${encodeURIComponent(jobId)}/live_status`,
    );
  }

  /**
   * GET /workflows/runs/{run_id}/results/download-links — signed URLs.
   *
   * URLs expire in 15 minutes, so fetch and parse the CSV right away.
   */
  async getDownloadLinks(jobId: string): Promise<DownloadLinksResponse> {
    if (!jobId) {
      throw new Error("getDownloadLinks: jobId is required");
    }
    return this.request<DownloadLinksResponse>(
      "GET",
      `/workflows/runs/${encodeURIComponent(jobId)}/results/download-links`,
    );
  }

  /**
   * Convenience: fetch the final-block result CSV as text.
   *
   * Picks the last download link in the array (Sixtyfour returns them in
   * block order, so the last is the workflow's final output). If you need
   * intermediate blocks, call `getDownloadLinks` directly.
   */
  async fetchFinalResultCsv(jobId: string): Promise<string> {
    const links = await this.getDownloadLinks(jobId);
    if (links.length === 0) {
      throw new SixtyfourApiError(502, "no_results", `Run ${jobId} produced no result files`);
    }
    const finalLink = links[links.length - 1];
    if (!finalLink) {
      throw new SixtyfourApiError(502, "no_results", `Run ${jobId} produced no result files`);
    }
    const res = await this.fetchImpl(finalLink.download_url);
    if (!res.ok) {
      throw new SixtyfourApiError(
        res.status,
        "csv_download_failed",
        `Failed to fetch result CSV (${res.status})`,
      );
    }
    return await res.text();
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    options: { body?: unknown } = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "x-api-key": this.apiKey,
      Accept: "application/json",
    };
    let bodyInit: string | undefined;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      bodyInit = JSON.stringify(options.body);
    }

    const res = await this.fetchImpl(url, {
      method,
      headers,
      body: bodyInit,
    });

    const text = await res.text();
    if (!res.ok) {
      let code = "unknown";
      let message = text;
      try {
        const parsed = JSON.parse(text) as {
          detail?: unknown;
          error?: { code?: string; message?: string };
        };
        if (parsed.error?.code) code = parsed.error.code;
        if (parsed.error?.message) message = parsed.error.message;
        if (typeof parsed.detail === "string") message = parsed.detail;
        else if (Array.isArray(parsed.detail) && parsed.detail.length > 0) {
          message = JSON.stringify(parsed.detail);
        }
      } catch {
        // Leave defaults
      }
      throw new SixtyfourApiError(
        res.status,
        code,
        `Sixtyfour ${method} ${path} failed (${res.status}): ${message.slice(0, 500)}`,
        text,
      );
    }

    if (text.length === 0) return undefined as T;
    return JSON.parse(text) as T;
  }
}
