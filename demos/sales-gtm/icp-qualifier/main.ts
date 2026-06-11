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

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SixtyfourApiError, SixtyfourClient } from "@sixtyfour-demos/api-client";

const ICP_STRUCT_FIELDS: Record<string, string> = {
  company_name: "Official company name",
  industry: "Primary industry or vertical (1–3 words)",
  headquarters: "City, state/region, country of headquarters",
  employee_count: "Estimated total employees (integer)",
  employee_count_range:
    "Headcount bucket (e.g. '50-200', '200-500', '500-1000', '1000+')",
  annual_revenue_estimate:
    "Most recent known ARR or annual revenue with source year",
  funding_stage:
    "Latest funding stage (Seed, Series A, B, C, D+, Public, Bootstrapped)",
  last_funding_round: "Most recent round: name, amount, lead investor",
  last_funding_date: "Date of last funding (YYYY-MM-DD or YYYY)",
  primary_buyer_persona:
    "Primary buyer role at the company (CTO, VP Eng, CFO, etc.)",
  tech_stack_signals: "Notable technologies in use (3–6 items)",
  key_products_or_services: "What the company sells — one sentence",
  target_market: "Who they sell to / their ICP",
  notable_signals:
    "Recent activity (launch, hire, layoff, fundraise) in last 90 days",
};

async function main() {
  await loadEnvFile();
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

  const struct: Record<string, string> = {
    ...ICP_STRUCT_FIELDS,
    icp_fit_score: `Integer 0–100 scoring this company against the following ICP rubric: "${icpDescription.replace(/"/g, '\\"')}". A score >= 75 is "strong", 50-74 "moderate", 25-49 "weak", < 25 "unfit".`,
    icp_verdict: "One of: strong | moderate | weak | unfit",
    icp_reasoning:
      "2–4 sentences explaining the fit score, citing specific company facts from above",
    icp_key_facts:
      "5–8 bullet strings of company facts most relevant to the rubric",
    icp_mismatches:
      "ICP criteria the company fails to meet. 'none' if perfect fit.",
  };

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

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(
      `\n✗ ${name} is not set. ` +
        `Copy .env.example to .env, fill in your values, then re-run \`pnpm start\`.`,
    );
    process.exit(1);
  }
  return v;
}

async function loadEnvFile() {
  const here = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(here, ".env");
  let text: string;
  try {
    text = await readFile(envPath, "utf8");
  } catch {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
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
