/**
 * ICP Qualifier — standalone demo runner.
 *
 * What this does:
 *   1. Reads SIXTYFOUR_API_KEY + TARGET_DOMAIN + ICP_DESCRIPTION from env.
 *   2. Makes a single POST /company-intelligence call with a struct
 *      tailored for ICP scoring fields.
 *   3. Prints the structured result.
 *
 * This is the simplest possible Sixtyfour demo — one API call, one response,
 * no workflow provisioning required.
 *
 * Run:
 *   cp .env.example .env
 *   # paste your SIXTYFOUR_API_KEY into .env
 *   pnpm install
 *   pnpm start
 */

import { SixtyfourApiError, SixtyfourClient, buildIcpStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

async function main() {
  await loadEnvFile(import.meta.url);
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");
  const domain = process.env.TARGET_DOMAIN || "ramp.com";
  const icpDescription =
    process.env.ICP_DESCRIPTION ||
    "B2B SaaS companies, 50–500 employees, US HQ, Series B+ funded in the last 24 months, technical buyer in engineering or finance.";

  const client = new SixtyfourClient({
    apiKey,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });

  console.log(`\n→ Scoring ${domain} against your ICP…\n`);
  console.log(`  ICP: "${icpDescription.slice(0, 80)}${icpDescription.length > 80 ? "…" : ""}"`);
  console.log(`  (this takes 15–60s — one API call, no polling needed)\n`);

  const struct = buildIcpStruct(icpDescription);

  const result = await client.companyIntelligence({
    target_company: { website: domain },
    struct,
    tier: "low",
  });

  const data = result.structured_data;
  console.log("=== ICP Score ===");
  console.log(
    `${data.company_name ?? domain} — fit_score ${data.icp_fit_score ?? "?"} (${data.icp_verdict ?? "?"})`,
  );
  console.log(`Industry: ${data.industry ?? "?"}`);
  console.log(`Headcount: ${data.employee_count_range ?? data.employee_count ?? "?"}`);
  console.log(`Funding: ${data.funding_stage ?? "?"} — ${data.last_funding_round ?? "?"}`);
  console.log(`\nReasoning: ${data.icp_reasoning ?? "(none)"}`);
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
