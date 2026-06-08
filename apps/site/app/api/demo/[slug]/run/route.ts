import { NextResponse } from "next/server";
import { SixtyfourApiError } from "@sixtyfour-demos/api-client";
import { getDemoBySlug } from "../../../../../lib/demos";
import {
  ServerConfigError,
  getSixtyfourClient,
  getWorkflowIdForDemo,
  buildIcpStruct,
} from "../../../../../lib/sixtyfour-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/demo/[slug]/run — kick off a demo run.
 *
 * Two modes:
 *   - "direct":   calls /company-intelligence (SYNC) and returns a streaming
 *                 text/event-stream response. The stream sends heartbeat pings
 *                 every few seconds while the enrichment runs, then emits the
 *                 result as a final SSE event. This avoids the broken
 *                 /job-status async endpoint entirely.
 *   - "workflow": calls /workflows/run and returns { job_id } for polling.
 *
 * The Sixtyfour API key never leaves the server.
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const demo = getDemoBySlug(params.slug);
  if (!demo || demo.status !== "live") {
    return NextResponse.json({ error: "demo not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = demo.inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid input",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  let client: ReturnType<typeof getSixtyfourClient>;
  try {
    client = getSixtyfourClient();
  } catch (err) {
    if (err instanceof ServerConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    throw err;
  }

  // ── Direct mode: SSE stream wrapping the sync /company-intelligence call ──
  if (demo.mode === "direct") {
    const input = parsed.data as { domain: string; icp_description: string };
    const requestBody = {
      target_company: { website: input.domain },
      struct: buildIcpStruct(input.icp_description),
      tier: "low" as const,
    };

    const encoder = new TextEncoder();
    const sseEvent = (event: string, data: unknown) =>
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    const stream = new ReadableStream({
      async start(controller) {
        // Heartbeat keeps the connection alive and gives the browser a visible
        // "still running" signal. We send one immediately so the client can
        // transition from "starting" to "running" right away.
        controller.enqueue(
          sseEvent("status", { status: "running", message: "Agent started — researching company…", progress: 10 }),
        );

        let heartbeatTimer: ReturnType<typeof setInterval> | null = setInterval(() => {
          try {
            controller.enqueue(
              sseEvent("ping", { t: Date.now(), message: "Agent still running…" }),
            );
          } catch {
            // Stream already closed
          }
        }, 4000);

        const clearHb = () => {
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        };

        try {
          console.log("[run/sse] calling /company-intelligence for", input.domain);
          const result = await client.companyIntelligence(requestBody);
          console.log("[run/sse] enrichment complete for", input.domain);
          clearHb();
          controller.enqueue(
            sseEvent("result", {
              status: "completed",
              result: result.structured_data ?? result,
            }),
          );
        } catch (err) {
          clearHb();
          let message = "Enrichment failed";
          if (err instanceof SixtyfourApiError) {
            message = err.message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          console.error("[run/sse] error:", message);
          controller.enqueue(sseEvent("error", { status: "failed", error: message }));
        } finally {
          clearHb();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // ── Workflow mode: kick off async run, return job_id for polling ──
  try {
    const workflowId = getWorkflowIdForDemo(params.slug);
    const run = await client.runWorkflow(workflowId, {
      webhook_payload: [parsed.data as Record<string, unknown>],
    });
    return NextResponse.json({ job_id: run.job_id, mode: "workflow" });
  } catch (err) {
    if (err instanceof SixtyfourApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      );
    }
    console.error("/run workflow unexpected error", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
