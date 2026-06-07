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
 *   - "direct": calls /company-intelligence-async, returns { task_id }
 *   - "workflow": calls /workflows/run, returns { job_id }
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

  try {
    const client = getSixtyfourClient();

    if (demo.mode === "direct") {
      const input = parsed.data as { domain: string; icp_description: string };
      const asyncRes = await client.companyIntelligenceAsync({
        target_company: { website: input.domain },
        struct: buildIcpStruct(input.icp_description),
        tier: "low",
      });
      return NextResponse.json({ task_id: asyncRes.task_id, mode: "direct" });
    }

    // Workflow mode
    const workflowId = getWorkflowIdForDemo(params.slug);
    const run = await client.runWorkflow(workflowId, {
      webhook_payload: [parsed.data as Record<string, unknown>],
    });
    return NextResponse.json({ job_id: run.job_id, mode: "workflow" });
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
    console.error("/run unexpected error", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
