/**
 * KYB Report — standalone demo script.
 *
 * Generates a Know Your Business due-diligence packet on any company using
 * Sixtyfour's /company-intelligence endpoint. Returns a structured report
 * covering beneficial ownership, sanctions exposure, shell-company signals,
 * adverse media, and an overall risk verdict.
 *
 * Usage:
 *   cp .env.example .env
 *   # paste your SIXTYFOUR_API_KEY into .env
 *   pnpm install
 *   pnpm start
 *
 * Env vars (all optional except SIXTYFOUR_API_KEY):
 *   SIXTYFOUR_API_KEY      — required
 *   TARGET_DOMAIN          — domain to investigate (default: sixtyfour.ai)
 *   SIXTYFOUR_API_BASE_URL — override API base URL (default: https://api.sixtyfour.ai)
 */

import { SixtyfourApiError, SixtyfourClient, buildKybStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

async function main() {
  await loadEnvFile(import.meta.url);
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");
  const domain = process.env.TARGET_DOMAIN || "sixtyfour.ai";

  const client = new SixtyfourClient({
    apiKey,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });

  console.log(`\n→ Running KYB checks on ${domain}…\n`);
  console.log(`  (this takes 15–60s — one API call, no polling needed)\n`);

  const result = await client.companyIntelligence({
    target_company: { website: domain },
    struct: buildKybStruct(),
    tier: "low",
  });

  const data = result.structured_data;

  console.log("=== KYB Report ===");
  console.log(`${data.company_name ?? domain}`);
  console.log(`Jurisdiction:  ${data.jurisdiction ?? "?"}`);
  console.log(`Status:        ${data.operational_status ?? "?"}`);
  console.log(`Risk verdict:  ${data.risk_verdict ?? "?"} (score: ${data.risk_score ?? "?"})`);
  console.log(`\nRisk summary: ${data.risk_summary ?? "(none)"}`);

  if (data.beneficial_owners && data.beneficial_owners !== "None found") {
    console.log(`\nBeneficial owners:\n  ${data.beneficial_owners}`);
  }
  if (data.sanctions_exposure && data.sanctions_exposure !== "None found") {
    console.log(`\nSanctions exposure:\n  ${data.sanctions_exposure}`);
  }
  if (data.shell_company_signals && data.shell_company_signals !== "None found") {
    console.log(`\nShell company signals:\n  ${data.shell_company_signals}`);
  }
  if (data.adverse_media_summary && data.adverse_media_summary !== "None found") {
    console.log(`\nAdverse media:\n  ${data.adverse_media_summary}`);
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
