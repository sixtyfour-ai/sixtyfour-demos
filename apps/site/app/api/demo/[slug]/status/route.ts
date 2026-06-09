import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/demo/[slug]/status — not used by current demos.
 *
 * All live demos stream results via SSE from /run. This route is kept as a
 * stub so the path doesn't 404 if called, and can be expanded when async
 * workflow demos are added.
 */
export async function GET() {
  return NextResponse.json(
    { error: "status polling is not used by current demos — results stream via /run" },
    { status: 410 },
  );
}
