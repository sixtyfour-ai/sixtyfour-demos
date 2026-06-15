/**
 * Founder Background Check — standalone demo script.
 *
 * Generates a structured due-diligence profile on any founder using
 * Sixtyfour's /people-intelligence endpoint: prior ventures and outcomes,
 * funding and exit history, key investors, reputation signals, controversies,
 * legal issues, and an overall background verdict.
 *
 * Usage:
 *   cp .env.example .env
 *   # paste your SIXTYFOUR_API_KEY into .env
 *   pnpm install
 *   pnpm start
 *
 * Env vars (all optional except SIXTYFOUR_API_KEY):
 *   SIXTYFOUR_API_KEY      — required
 *   TARGET_NAME            — founder's full name (default: Saarth Shah)
 *   TARGET_COMPANY         — current or most recent company (default: Sixtyfour)
 *   TARGET_LINKEDIN        — confirmed LinkedIn URL (optional, anchors identity)
 *   SIXTYFOUR_API_BASE_URL — override API base URL (default: https://api.sixtyfour.ai)
 */

import { SixtyfourApiError, SixtyfourClient, buildFounderStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

async function main() {
  await loadEnvFile(import.meta.url);
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");
  const targetName = process.env.TARGET_NAME || "Saarth Shah";
  const targetCompany = process.env.TARGET_COMPANY || "Sixtyfour";
  const targetLinkedin = process.env.TARGET_LINKEDIN;

  const client = new SixtyfourClient({
    apiKey,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });

  console.log(`\n→ Running background check on ${targetName} (${targetCompany})…\n`);
  if (targetLinkedin) console.log(`  LinkedIn hint: ${targetLinkedin}`);
  console.log(`  (this takes 15–60s — one API call, no polling needed)\n`);

  const result = await client.peopleIntelligence({
    lead_info: {
      full_name: targetName,
      company: targetCompany,
      ...(targetLinkedin ? { linkedin_url: targetLinkedin } : {}),
    },
    struct: buildFounderStruct(),
    tier: "low",
  });

  const data = result.structured_data;

  console.log("=== Founder Background Check ===");
  console.log(`${data.full_name ?? targetName}`);
  console.log(`Role:              ${data.current_role ?? "?"}`);
  console.log(`Background verdict: ${data.background_verdict ?? "?"}`);
  console.log(`\nSummary: ${data.background_summary ?? "(none)"}`);

  if (data.prior_companies_founded && data.prior_companies_founded !== "None found") {
    console.log(`\nCompanies founded:\n  ${data.prior_companies_founded}`);
  }
  if (data.total_capital_raised && data.total_capital_raised !== "Unknown") {
    console.log(`\nTotal capital raised:\n  ${data.total_capital_raised}`);
  }
  if (data.exit_history && data.exit_history !== "None found") {
    console.log(`\nExit history:\n  ${data.exit_history}`);
  }
  if (data.controversies_or_red_flags && data.controversies_or_red_flags !== "None found") {
    console.log(`\nControversies / red flags:\n  ${data.controversies_or_red_flags}`);
  }
  if (data.legal_or_regulatory_issues && data.legal_or_regulatory_issues !== "None found") {
    console.log(`\nLegal or regulatory issues:\n  ${data.legal_or_regulatory_issues}`);
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
