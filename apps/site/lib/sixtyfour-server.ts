import { SixtyfourClient } from "@sixtyfour-demos/api-client";

/**
 * Server-only Sixtyfour helpers.
 *
 * NEVER import this module from a Client Component or any code that ends
 * up bundled for the browser.
 *
 * Key resolution order:
 *   1. `apiKey` argument — passed from the request body (BYOK / hosted site)
 *   2. `SIXTYFOUR_API_KEY` env var — used when running locally via `pnpm dev`
 *
 * This means the hosted site at demos.sixtyfour.ai never needs a server-side
 * API key; each visitor supplies their own. Local dev still works with a
 * .env file for convenience.
 */

export class ServerConfigError extends Error {}

export function getSixtyfourClient(apiKey?: string): SixtyfourClient {
  const key = apiKey ?? process.env.SIXTYFOUR_API_KEY;
  if (!key || key.length === 0) {
    throw new ServerConfigError(
      "No API key provided. Add your Sixtyfour API key in the settings panel, or set SIXTYFOUR_API_KEY in .env for local development.",
    );
  }
  return new SixtyfourClient({
    apiKey: key,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });
}

// Re-export struct builders from the shared api-client package.
export {
  buildFounderStruct,
  buildIcpStruct,
  buildKybStruct,
  buildTalentStruct,
  buildThreatActorStruct,
} from "@sixtyfour-demos/api-client";
