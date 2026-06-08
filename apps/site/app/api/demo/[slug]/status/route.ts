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
  console.log("[status] raw job-status response:", JSON.stringify(jobStatus));

  const s = (jobStatus.status ?? "").toLowerCase();

  // Terminal success — documented response shape:
  //   { status: "completed", result: { notes, structured_data, findings, references, confidence_score }, run_id, ... }
  if (s === "completed") {
    const result = jobStatus.result ?? jobStatus; // fallback: some old API versions embed fields at top level
    const typed = result as import("@sixtyfour-demos/api-client").CompanyIntelligenceResponse;
    return NextResponse.json({
      status: "completed",
      progress: 100,
      message: "Done",
      result: typed.structured_data ?? typed,
    });
  }

  // All Temporal terminal failure states
  if (["failed", "error", "cancelled", "canceled", "terminated", "timed_out"].includes(s)) {
    return NextResponse.json({
      status: "failed",
      error: jobStatus.error ?? `Job ended with status: ${jobStatus.status ?? "unknown"}`,
    });
  }

  // "running", "queued", "pending", "continued_as_new" → keep polling
  const isRunning = s === "running" || s === "processing";
  return NextResponse.json({
    status: "running",
    raw_status: jobStatus.status,
    progress: isRunning ? 50 : 10,
    message: isRunning ? "Researching company…" : "Queued — waiting for agent…",
    run_id: jobStatus.run_id ?? null,
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
