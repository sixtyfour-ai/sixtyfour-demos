/**
 * Competitive Org Intel — standalone demo script.
 *
 * Generates a structured competitive snapshot on any company using
 * Sixtyfour's /company-intelligence endpoint: headcount trend over 6/12
 * months, C-suite and VP roster, recent leadership changes and key hires,
 * open role signals, layoffs, product launches, funding, and competitive moves.
 *
 * Usage:
 *   cp .env.example .env
 *   # paste your SIXTYFOUR_API_KEY into .env
 *   pnpm install
 *   pnpm start
 *
 * Env vars (all optional except SIXTYFOUR_API_KEY):
 *   SIXTYFOUR_API_KEY      — required
 *   TARGET_DOMAIN          — competitor domain to research (default: sixtyfour.ai)
 *   SIXTYFOUR_API_BASE_URL — override API base URL (default: https://api.sixtyfour.ai)
 */

import { SixtyfourApiError, SixtyfourClient, buildCompetitiveOrgStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

async function main() {
  await loadEnvFile(import.meta.url);
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");
  const domain = process.env.TARGET_DOMAIN || "sixtyfour.ai";

  const client = new SixtyfourClient({
    apiKey,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });

  console.log(`\n→ Running competitive org snapshot for ${domain}…\n`);
  console.log(`  (this takes 15–60s — one API call, no polling needed)\n`);

  const result = await client.companyIntelligence({
    target_company: { website: domain },
    struct: buildCompetitiveOrgStruct(),
    tier: "low",
  });

  const data = result.structured_data;

  console.log("=== Competitive Org Intel ===");
  console.log(`${data.company_name ?? domain}`);
  console.log(`HQ:                ${data.headquarters ?? "?"}`);
  console.log(`Headcount (now):   ${data.employee_count_current ?? "?"}`);
  console.log(`Headcount trend:   ${data.headcount_trend ?? "?"} (${data.headcount_trend_pct ?? "?"})`);
  console.log(`\nLeadership:`);
  console.log(`  CEO: ${data.ceo ?? "?"}`);
  console.log(`  CTO: ${data.cto ?? "?"}`);
  console.log(`  CPO: ${data.cpo ?? "?"}`);

  if (data.leadership_changes_90d && data.leadership_changes_90d !== "None found") {
    console.log(`\nLeadership changes (90d):\n  ${data.leadership_changes_90d}`);
  }
  if (data.key_hires_90d && data.key_hires_90d !== "None found") {
    console.log(`\nKey hires (90d):\n  ${data.key_hires_90d}`);
  }
  if (data.open_roles_signals && data.open_roles_signals !== "None found") {
    console.log(`\nOpen role signals:\n  ${data.open_roles_signals}`);
  }
  if (data.product_launches_90d && data.product_launches_90d !== "None found") {
    console.log(`\nProduct launches (90d):\n  ${data.product_launches_90d}`);
  }
  if (data.competitive_signals && data.competitive_signals !== "None found") {
    console.log(`\nCompetitive signals:\n  ${data.competitive_signals}`);
  }
  if (data.recent_funding) {
    console.log(`\nRecent funding:\n  ${data.recent_funding}`);
  }
  if (data.layoffs_or_reductions && data.layoffs_or_reductions !== "None found") {
    console.log(`\nLayoffs / reductions:\n  ${data.layoffs_or_reductions}`);
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
