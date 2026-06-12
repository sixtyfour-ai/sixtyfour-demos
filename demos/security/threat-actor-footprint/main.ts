/**
 * Threat Actor Footprint — standalone demo script.
 *
 * Maps a person's online footprint using Sixtyfour's /people-intelligence
 * endpoint with an OSINT-oriented struct: social profiles, dark web mentions,
 * credential leak exposure, threat actor signals, and an overall risk verdict.
 *
 * Usage:
 *   cp .env.example .env
 *   # paste your SIXTYFOUR_API_KEY into .env
 *   pnpm install
 *   pnpm start
 *
 * Env vars (all optional except SIXTYFOUR_API_KEY):
 *   SIXTYFOUR_API_KEY      — required
 *   TARGET_NAME            — subject's full name (default: Saarth Shah)
 *   TARGET_EMAIL           — known email address (optional, improves accuracy)
 *   TARGET_LINKEDIN        — confirmed LinkedIn URL (optional, anchors identity)
 *   SIXTYFOUR_API_BASE_URL — override API base URL (default: https://api.sixtyfour.ai)
 */

import { SixtyfourApiError, SixtyfourClient, buildThreatActorStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

async function main() {
  await loadEnvFile(import.meta.url);
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");
  const targetName = process.env.TARGET_NAME || "Saarth Shah";
  const targetEmail = process.env.TARGET_EMAIL;
  const targetLinkedin = process.env.TARGET_LINKEDIN;

  const client = new SixtyfourClient({
    apiKey,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });

  console.log(`\n→ Mapping footprint for ${targetName}…\n`);
  if (targetEmail) console.log(`  Email hint: ${targetEmail}`);
  if (targetLinkedin) console.log(`  LinkedIn hint: ${targetLinkedin}`);
  console.log(`  (this takes 15–60s — one API call, no polling needed)\n`);

  const result = await client.peopleIntelligence({
    lead_info: {
      full_name: targetName,
      ...(targetEmail ? { email: targetEmail } : {}),
      ...(targetLinkedin ? { linkedin_url: targetLinkedin } : {}),
    },
    struct: buildThreatActorStruct(),
    tier: "low",
  });

  const data = result.structured_data;

  console.log("=== Threat Actor Footprint ===");
  console.log(`${data.full_name ?? targetName}`);
  console.log(`Risk verdict:  ${data.risk_verdict ?? "?"} (score: ${data.risk_score ?? "?"})`);
  console.log(`\nRisk summary: ${data.risk_summary ?? "(none)"}`);

  if (data.known_aliases && data.known_aliases !== "None found") {
    console.log(`\nAliases:\n  ${data.known_aliases}`);
  }
  if (data.social_profiles && data.social_profiles !== "None found") {
    console.log(`\nSocial profiles:\n  ${data.social_profiles}`);
  }
  if (data.credential_leak_exposure && data.credential_leak_exposure !== "None found") {
    console.log(`\nCredential leak exposure:\n  ${data.credential_leak_exposure}`);
  }
  if (data.dark_web_mentions && data.dark_web_mentions !== "None found") {
    console.log(`\nDark web mentions:\n  ${data.dark_web_mentions}`);
  }
  if (data.threat_actor_signals && data.threat_actor_signals !== "None found") {
    console.log(`\nThreat actor signals:\n  ${data.threat_actor_signals}`);
  }

  console.log(`\nConfidence: ${result.confidence_score ?? "?"}/10`);
  console.log("\nFull JSON:");
  console.log(JSON.stringify(data, null, 2));

  if (result.references && Object.keys(result.references).length > 0) {
    console.log("\nSources:");
    for (const url of Object.keys(result.references).slice(0, 8)) {
      console.log(`  ${url}`);
    }
  }
}

main().catch((err) => {
  if (err instanceof SixtyfourApiError) {
    console.error(`\n✗ Sixtyfour API error (${err.status}): ${err.message}`);
  } else {
    console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  }
  process.exit(1);
});
