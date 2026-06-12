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

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SixtyfourApiError, SixtyfourClient } from "@sixtyfour-demos/api-client";

const KYB_STRUCT: Record<string, string> = {
  company_name: "Official registered company name",
  registration_number: "Company registration or incorporation number (if findable)",
  jurisdiction: "Country and state/province of incorporation",
  registered_address: "Registered office address",
  operating_address: "Primary operating address if different from registered",
  company_type: "Legal entity type (LLC, C-Corp, Ltd, GmbH, etc.)",
  incorporation_date: "Date of incorporation (YYYY-MM-DD or YYYY)",
  operational_status: "Active, Dissolved, Suspended, or Unknown",
  industry: "Primary industry or vertical (1–3 words)",
  employee_count: "Estimated total employees (integer)",
  annual_revenue_estimate: "Most recent known annual revenue with source year",
  beneficial_owners:
    "Known ultimate beneficial owners (UBOs) owning >= 10%. Format: 'Name – ownership %, role'. 'None found' if not identified.",
  key_executives:
    "Current CEO, CFO, and board chair (name + title). 'Unknown' if not found.",
  parent_company: "Immediate parent entity and its jurisdiction. 'None' if independent.",
  subsidiaries: "Known subsidiaries or affiliated entities. 'None found' if none.",
  sanctions_exposure:
    "Any matches or near-matches on OFAC SDN, EU consolidated, UN, or UKOF sanctions lists. 'None found' if clean.",
  pep_exposure:
    "Any executives or owners who are Politically Exposed Persons (PEPs). 'None found' if clean.",
  shell_company_signals:
    "Indicators of a shell or pass-through entity: nominee directors, no employees, virtual office address, complex ownership layers. 'None found' if absent.",
  adverse_media_summary:
    "Recent negative news: fraud, litigation, regulatory action, money-laundering allegations. Date-stamped where possible. 'None found' if clean.",
  litigation_and_regulatory:
    "Active or recent lawsuits, fines, license revocations, or regulatory investigations. 'None found' if clean.",
  risk_score:
    "Integer 0–100 reflecting overall KYB risk. 0 = very low risk, 100 = very high risk.",
  risk_verdict:
    "One of: low | medium | high | critical — based on aggregate signals above.",
  risk_summary:
    "3–5 sentences summarising the key risk findings and the basis for the verdict.",
  data_sources_note:
    "Brief note on the primary sources used (company registries, sanctions lists, news, EDGAR, etc.) and any data gaps.",
};

async function main() {
  await loadEnvFile();
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
    struct: KYB_STRUCT,
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
