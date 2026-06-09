/**
 * SixtyfourClient — thin fetch wrapper around api.sixtyfour.ai.
 *
 * Design notes:
 * - Uses native `fetch` (Node >=18, Edge, browser). No deps.
 * - Throws `SixtyfourApiError` on non-2xx so callers can branch on status.
 * - The client never reads `process.env`. Always pass an explicit apiKey,
 *   so the same code works in Node scripts, Next.js API routes, and tests.
 */

import { SixtyfourApiError } from "./errors";
import type {
  CompanyIntelligenceRequest,
  CompanyIntelligenceResponse,
  PeopleIntelligenceRequest,
  PeopleIntelligenceResponse,
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
  // Company Intelligence
  // -------------------------------------------------------------------------

  /** POST /company-intelligence — synchronous single-company enrichment. */
  async companyIntelligence(
    body: CompanyIntelligenceRequest,
  ): Promise<CompanyIntelligenceResponse> {
    return this.request<CompanyIntelligenceResponse>("POST", "/company-intelligence", { body });
  }

  // -------------------------------------------------------------------------
  // People Intelligence
  // -------------------------------------------------------------------------

  /** POST /people-intelligence — synchronous single-person enrichment. */
  async peopleIntelligence(
    body: PeopleIntelligenceRequest,
  ): Promise<PeopleIntelligenceResponse> {
    return this.request<PeopleIntelligenceResponse>("POST", "/people-intelligence", { body });
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
