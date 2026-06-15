import { NextResponse } from "next/server";
import { SixtyfourApiError } from "@sixtyfour-demos/api-client";
import { getDemoBySlug } from "../../../../../lib/demos";
import {
  ServerConfigError,
  getSixtyfourClient,
  buildCompetitiveOrgStruct,
  buildFounderStruct,
  buildIcpStruct,
  buildTalentStruct,
  buildKybStruct,
  buildThreatActorStruct,
} from "../../../../../lib/sixtyfour-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TODO: migrate all demo slugs to async polling once all demos are shipped.
//
// Architecture:
//   1. POST /company-intelligence-async or /people-intelligence-async → returns { task_id } immediately
//   2. Return task_id to client (short Vercel response, no timeout risk)
//   3. Client polls GET /api/demo/[slug]/status?task_id=... every ~5s
//   4. Each poll is a lightweight Vercel function that calls GET /job-status/{task_id} and proxies the result
//   5. Client reads result.structured_data when status === "completed"
//
// IMPORTANT — status casing is inconsistent, normalize before comparing:
//   Submit response returns:  { "status": "RUNNING" }   ← uppercase
//   Poll responses return:    { "status": "running" }   ← lowercase
//   Terminal states ("completed", "failed", "cancelled") — casing TBD, treat case-insensitively
//   Safe pattern:  status.toLowerCase() === "completed"
//
// Verified working: new jobs poll to "completed" correctly (tested 2026-06-12).
// The sync endpoint (this file) stays as the fallback for local dev and low-tier fast calls.

/** Safe user-facing message — never forward raw upstream API bodies. */
function userFacingEnrichmentError(err: unknown): string {
  if (err instanceof SixtyfourApiError) {
    if (err.status === 401 || err.status === 403) {
      return "Invalid API key. Check your key in the API key settings.";
    }
    if (err.status === 429) {
      return "Rate limit exceeded. Try again in a few minutes.";
    }
    if (err.status >= 500) {
      return "Sixtyfour is temporarily unavailable. Try again shortly.";
    }
    return "Enrichment failed. Check your inputs and API key, then try again.";
  }
  return "Enrichment failed. Try again or check your API key.";
}

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
  const abortController = new AbortController();
  const { signal } = abortController;

  if (req.signal.aborted) {
    abortController.abort();
  } else {
    req.signal.addEventListener("abort", () => abortController.abort(), { once: true });
  }

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
          console.log("[run/sse] calling /people-intelligence", { slug });
          const piResult = await client.peopleIntelligence(
            {
              lead_info: {
                full_name: input.full_name,
                company: input.company,
                ...(input.linkedin_url ? { linkedin_url: input.linkedin_url } : {}),
              },
              struct: buildTalentStruct(),
              tier: "low",
            },
            { signal },
          );
          console.log("[run/sse] enrichment complete", { slug, endpoint: "people-intelligence" });
          result = (piResult.structured_data ?? piResult) as Record<string, unknown>;
        } else if (slug === "threat-actor-footprint") {
          const input = parsed.data as {
            full_name: string;
            email?: string;
            linkedin_url?: string;
          };
          controller.enqueue(
            sseEvent("status", {
              status: "running",
              message: `Mapping footprint for ${input.full_name}…`,
              progress: 15,
            }),
          );
          console.log("[run/sse] calling /people-intelligence", { slug });
          const threatResult = await client.peopleIntelligence(
            {
              lead_info: {
                full_name: input.full_name,
                ...(input.email ? { email: input.email } : {}),
                ...(input.linkedin_url ? { linkedin_url: input.linkedin_url } : {}),
              },
              struct: buildThreatActorStruct(),
              tier: "low",
            },
            { signal },
          );
          console.log("[run/sse] enrichment complete", { slug, endpoint: "people-intelligence" });
          result = (threatResult.structured_data ?? threatResult) as Record<string, unknown>;
        } else if (slug === "kyb-report") {
          const input = parsed.data as { domain: string };
          controller.enqueue(
            sseEvent("status", {
              status: "running",
              message: `Running KYB check on ${input.domain}…`,
              progress: 15,
            }),
          );
          console.log("[run/sse] calling /company-intelligence", { slug });
          const kybResult = await client.companyIntelligence(
            {
              target_company: { website: input.domain },
              struct: buildKybStruct(),
              tier: "low" as const,
            },
            { signal },
          );
          console.log("[run/sse] enrichment complete", { slug, endpoint: "company-intelligence" });
          result = (kybResult.structured_data ?? kybResult) as Record<string, unknown>;
        } else if (slug === "competitive-org-intel") {
          const input = parsed.data as { domain: string };
          controller.enqueue(
            sseEvent("status", {
              status: "running",
              message: `Mapping org snapshot for ${input.domain}…`,
              progress: 15,
            }),
          );
          console.log("[run/sse] calling /company-intelligence", { slug });
          const coiResult = await client.companyIntelligence(
            {
              target_company: { website: input.domain },
              struct: buildCompetitiveOrgStruct(),
              tier: "low",
            },
            { signal },
          );
          console.log("[run/sse] enrichment complete", { slug, endpoint: "company-intelligence" });
          result = (coiResult.structured_data ?? coiResult) as Record<string, unknown>;
        } else if (slug === "founder-background-check") {
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
          console.log("[run/sse] calling /people-intelligence", { slug });
          const founderResult = await client.peopleIntelligence(
            {
              lead_info: {
                full_name: input.full_name,
                company: input.company,
                ...(input.linkedin_url ? { linkedin_url: input.linkedin_url } : {}),
              },
              struct: buildFounderStruct(),
              tier: "low",
            },
            { signal },
          );
          console.log("[run/sse] enrichment complete", { slug, endpoint: "people-intelligence" });
          result = (founderResult.structured_data ?? founderResult) as Record<string, unknown>;
        } else {
          const input = parsed.data as { domain: string; icp_description: string };
          controller.enqueue(
            sseEvent("status", {
              status: "running",
              message: `Researching ${input.domain}…`,
              progress: 15,
            }),
          );
          console.log("[run/sse] calling /company-intelligence", { slug });
          const ciResult = await client.companyIntelligence(
            {
              target_company: { website: input.domain },
              struct: buildIcpStruct(input.icp_description),
              tier: "low" as const,
            },
            { signal },
          );
          console.log("[run/sse] enrichment complete", { slug, endpoint: "company-intelligence" });
          result = (ciResult.structured_data ?? ciResult) as Record<string, unknown>;
        }

        clearHb();
        controller.enqueue(sseEvent("result", { status: "completed", result }));
      } catch (err) {
        clearHb();
        if (signal.aborted) {
          console.log("[run/sse] enrichment aborted (client disconnected or cancelled)");
          return;
        }
        if (err instanceof SixtyfourApiError) {
          console.error("[run/sse] SixtyfourApiError", {
            status: err.status,
            code: err.code,
            message: err.message,
          });
        } else {
          console.error("[run/sse] error:", err);
        }
        const message = userFacingEnrichmentError(err);
        controller.enqueue(sseEvent("error", { status: "failed", error: message }));
      } finally {
        clearHb();
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
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
