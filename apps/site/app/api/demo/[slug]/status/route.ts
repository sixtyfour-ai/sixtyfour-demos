import { NextResponse } from "next/server";
import { SixtyfourApiError, parseResultCsv } from "@sixtyfour-demos/api-client";
import { getDemoBySlug } from "../../../../../lib/demos";
import {
  ServerConfigError,
  getSixtyfourClient,
} from "../../../../../lib/sixtyfour-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/demo/[slug]/status?job_id=...&mode=direct|workflow
 *
 * Two modes:
 *   - "direct": polls /job-status/{task_id} for async enrichments
 *   - "workflow": polls /workflows/runs/{job_id}/live_status
 *
 * Returns one of:
 *  - { status: "running", progress, message }       — keep polling
 *  - { status: "completed", progress: 100, result } — final result
 *  - { status: "failed", error }                    — terminal error
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const demo = getDemoBySlug(params.slug);
  if (!demo || demo.status !== "live") {
    return NextResponse.json({ error: "demo not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id");
  const mode = url.searchParams.get("mode") || demo.mode;
  if (!jobId) {
    return NextResponse.json({ error: "job_id query param required" }, { status: 400 });
  }

  try {
    const client = getSixtyfourClient();

    if (mode === "direct") {
      return await handleDirectStatus(client, jobId);
    }

    return await handleWorkflowStatus(client, jobId);
  } catch (err) {
    if (err instanceof ServerConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof SixtyfourApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      );
    }
    console.error("/status unexpected error", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

async function handleDirectStatus(
  client: import("@sixtyfour-demos/api-client").SixtyfourClient,
  taskId: string,
) {
  const jobStatus = await client.getJobStatus(taskId);

  if (jobStatus.status === "completed") {
    return NextResponse.json({
      status: "completed",
      progress: 100,
      message: "Done",
      result: jobStatus.result?.structured_data ?? jobStatus.result ?? null,
    });
  }

  if (jobStatus.status === "failed") {
    return NextResponse.json({
      status: "failed",
      error: jobStatus.error ?? "Enrichment failed",
    });
  }

  return NextResponse.json({
    status: "running",
    progress: jobStatus.status === "running" ? 50 : 10,
    message: jobStatus.status === "running" ? "Researching company…" : "Queued…",
  });
}

async function handleWorkflowStatus(
  client: import("@sixtyfour-demos/api-client").SixtyfourClient,
  jobId: string,
) {
  const status = await client.getLiveStatus(jobId);
  const overall = status.overall_status;

  if (overall === "completed") {
    const csv = await client.fetchFinalResultCsv(jobId);
    const rows = parseResultCsv(csv);
    const result = rows.length === 1 ? rows[0] : rows;
    return NextResponse.json({
      status: "completed",
      progress: 100,
      message: "Done",
      result,
    });
  }

  if (overall === "failed" || overall === "cancelled") {
    return NextResponse.json({
      status: overall,
      error: `Workflow ${overall}`,
    });
  }

  return NextResponse.json({
    status: "running",
    progress: status.overall_progress_percentage ?? 0,
    message: status.current_block
      ? `Running ${status.current_block} (${status.completed_blocks ?? 0}/${status.total_blocks ?? "?"})`
      : "Running…",
  });
}
