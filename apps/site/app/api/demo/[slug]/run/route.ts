import { NextResponse } from "next/server";
import { SixtyfourApiError } from "@sixtyfour-demos/api-client";
import { getDemoBySlug } from "../../../../../lib/demos";
import {
  ServerConfigError,
  getSixtyfourClient,
  buildIcpStruct,
  buildTalentStruct,
} from "../../../../../lib/sixtyfour-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/demo/[slug]/run — kick off a demo run.
 *
 * Expects a JSON body with the demo's input fields plus an optional
 * `_api_key` field containing the caller's Sixtyfour API key. If absent,
 * the server falls back to the SIXTYFOUR_API_KEY env var (local dev only).
 *
 * The API key is used for a single enrichment call and is never logged
 * or persisted. Results stream back as Server-Sent Events (SSE).
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const demo = getDemoBySlug(params.slug);
  if (!demo || demo.status !== "live") {
    return NextResponse.json({ error: "demo not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // Extract and remove _api_key before schema validation so demo schemas
  // don't need to declare it.
  const apiKey = typeof body._api_key === "string" ? body._api_key.trim() : undefined;
  const { _api_key: _removed, ...inputBody } = body;
  void _removed;

  const parsed = demo.inputSchema.safeParse(inputBody);
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
    client = getSixtyfourClient(apiKey);
  } catch (err) {
    if (err instanceof ServerConfigError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const encoder = new TextEncoder();
  const sseEvent = (event: string, data: unknown) =>
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const slug = params.slug;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        sseEvent("status", { status: "running", message: "Agent started — researching…", progress: 10 }),
      );

      let heartbeatTimer: ReturnType<typeof setInterval> | null = setInterval(() => {
        try {
          controller.enqueue(sseEvent("ping", { t: Date.now(), message: "Agent still running…" }));
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
        let result: Record<string, unknown>;

        if (slug === "passive-candidate-finder") {
          const input = parsed.data as {
            full_name: string;
            company: string;
            linkedin_url?: string;
          };
          controller.enqueue(
            sseEvent("status", {
              status: "running",
              message: `Researching ${input.full_name} at ${input.company}…`,
              progress: 15,
            }),
          );
          console.log("[run/sse] calling /people-intelligence for", input.full_name, "@", input.company);
          const piResult = await client.peopleIntelligence({
            lead_info: {
              full_name: input.full_name,
              company: input.company,
              ...(input.linkedin_url ? { linkedin_url: input.linkedin_url } : {}),
            },
            struct: buildTalentStruct(),
            tier: "low",
          });
          console.log("[run/sse] enrichment complete for", input.full_name);
          result = (piResult.structured_data ?? piResult) as Record<string, unknown>;
        } else {
          const input = parsed.data as { domain: string; icp_description: string };
          controller.enqueue(
            sseEvent("status", {
              status: "running",
              message: `Researching ${input.domain}…`,
              progress: 15,
            }),
          );
          console.log("[run/sse] calling /company-intelligence for", input.domain);
          const ciResult = await client.companyIntelligence({
            target_company: { website: input.domain },
            struct: buildIcpStruct(input.icp_description),
            tier: "low" as const,
          });
          console.log("[run/sse] enrichment complete for", input.domain);
          result = (ciResult.structured_data ?? ciResult) as Record<string, unknown>;
        }

        clearHb();
        controller.enqueue(sseEvent("result", { status: "completed", result }));
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
