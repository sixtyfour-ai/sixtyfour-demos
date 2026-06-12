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

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SixtyfourApiError, SixtyfourClient } from "@sixtyfour-demos/api-client";

const THREAT_ACTOR_STRUCT: Record<string, string> = {
  full_name: "Confirmed full legal name",
  known_aliases:
    "Other names, handles, or usernames attributed to this person. 'None found' if absent.",
  confirmed_emails: "Known email addresses, comma-separated. 'None found' if absent.",
  confirmed_phone_numbers: "Known phone numbers, comma-separated. 'None found' if absent.",
  social_profiles:
    "Confirmed social platform profiles (LinkedIn, Twitter/X, GitHub, Facebook, Instagram, etc.). Format: 'Platform: URL'. 'None found' if absent.",
  professional_background:
    "Current and recent employers, roles, and approximate tenure — one line each.",
  technical_skills:
    "Programming languages, security tools, platforms, or technical domains the subject is publicly associated with. 'None found' if not identifiable.",
  forum_and_community_presence:
    "Activity on technical forums, open-source communities, security communities, or niche platforms (HN, Reddit, Stack Overflow, etc.). 'None found' if absent.",
  dark_web_mentions:
    "Any mentions, handles, or references on dark web forums, paste sites, or underground markets. 'None found' if absent.",
  credential_leak_exposure:
    "Any email addresses or usernames appearing in known data breaches or credential dumps (cite source/date if known). 'None found' if absent.",
  domain_and_infrastructure:
    "Domains, IPs, or hosting infrastructure registered to or associated with this person. 'None found' if absent.",
  threat_actor_signals:
    "Indicators of malicious activity: known associations with threat groups, CVE authorship, responsible disclosure reports, or public attribution by researchers. 'None found' if absent.",
  legal_and_public_record:
    "Court records, regulatory actions, law enforcement mentions, or press reports of criminal or civil matters. 'None found' if absent.",
  risk_score:
    "Integer 0–100 reflecting overall threat / risk level. 0 = no signals, 100 = confirmed high-risk actor.",
  risk_verdict: "One of: none | low | medium | high | critical",
  risk_summary:
    "3–5 sentences summarising the key findings and the basis for the risk verdict.",
  data_sources_note:
    "Primary sources used (OSINT databases, social platforms, breach indices, public records, etc.) and any notable data gaps.",
};

async function main() {
  await loadEnvFile();
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
    struct: THREAT_ACTOR_STRUCT,
    tier: "medium",
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
