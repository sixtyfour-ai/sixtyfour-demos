/**
 * Passive Candidate Finder — standalone script.
 *
 * Enriches a person into a recruiter-ready profile using Sixtyfour's
 * /people-intelligence endpoint. Provide a name + company (and optionally
 * a LinkedIn URL for better accuracy) and get back a structured profile:
 * seniority, skills, career summary, contact signals, and open-to-work indicators.
 *
 * Usage:
 *   pnpm start
 *
 * Set SIXTYFOUR_API_KEY in .env (copy from .env.example).
 */

import { SixtyfourClient, buildTalentStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

// ---------------------------------------------------------------------------
// Input — edit these to try different candidates
// ---------------------------------------------------------------------------

const CANDIDATE = {
  full_name: "Saarth Shaw",
  company: "Sixtyfour",
  linkedin_url: "https://linkedin.com/in/saarth-shaw", // optional but improves accuracy
};

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  await loadEnvFile(import.meta.url);
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");

  const client = new SixtyfourClient({ apiKey });

  console.log(`\nEnriching candidate: ${CANDIDATE.full_name} @ ${CANDIDATE.company}`);
  console.log("─".repeat(60));

  const start = Date.now();

  const result = await client.peopleIntelligence({
    lead_info: {
      full_name: CANDIDATE.full_name,
      company: CANDIDATE.company,
      ...(CANDIDATE.linkedin_url ? { linkedin_url: CANDIDATE.linkedin_url } : {}),
    },
    struct: buildTalentStruct(),
    tier: "low",
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nCompleted in ${elapsed}s\n`);

  const data = result.structured_data ?? result;

  if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (Array.isArray(value)) {
        console.log(`\n${label}:`);
        for (const item of value) console.log(`  • ${item}`);
      } else {
        console.log(`\n${label}: ${value}`);
      }
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }

  if (result.notes) {
    console.log("\n─".repeat(60));
    console.log("Research notes:", result.notes);
  }

  if (result.confidence_score !== undefined) {
    console.log(`\nConfidence score: ${result.confidence_score}/10`);
  }
}

main().catch((err) => {
  console.error("\nError:", err instanceof Error ? err.message : err);
  process.exit(1);
});
