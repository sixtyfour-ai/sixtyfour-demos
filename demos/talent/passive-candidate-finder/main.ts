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

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { SixtyfourClient } from "@sixtyfour-demos/api-client";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dir = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency)
try {
  const envFile = readFileSync(resolve(__dir, ".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const [key, ...rest] = line.trim().split("=");
    if (key && !key.startsWith("#") && rest.length > 0) {
      process.env[key] = rest.join("=");
    }
  }
} catch {
  // .env not present — rely on environment
}

const API_KEY = process.env.SIXTYFOUR_API_KEY;
if (!API_KEY) {
  console.error("Error: SIXTYFOUR_API_KEY is not set. Copy .env.example to .env and add your key.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Input — edit these to try different candidates
// ---------------------------------------------------------------------------

const CANDIDATE = {
  full_name: "Saarth Shaw",
  company: "Sixtyfour",
  linkedin_url: "https://linkedin.com/in/saarth-shaw", // optional but improves accuracy
};

// ---------------------------------------------------------------------------
// Struct — define exactly what fields you want back
// ---------------------------------------------------------------------------

const TALENT_STRUCT: Record<string, string> = {
  current_title: "Current job title",
  current_company: "Current employer",
  seniority_level: "One of: IC, Senior IC, Staff, Principal, Manager, Director, VP, C-level",
  years_experience: "Total years of professional experience (integer)",
  key_skills: "5-8 technical or functional skills, comma-separated",
  tech_stack: "Technologies they've worked with based on current and recent roles",
  career_summary: "2-3 sentence career narrative written for a recruiter",
  notable_achievements: "2-4 bullet strings of standout achievements or projects",
  education: "Highest degree + institution",
  linkedin_url: "Confirmed LinkedIn profile URL",
  email: "Professional email address",
  open_to_work_signals:
    "Any public signals of job-seeking activity (posts, profile status, recent departures). 'none found' if absent.",
  recruiter_note: "One sentence: what makes this person worth reaching out to",
  last_company_tenure: "How long they've been at current company (e.g. '2 years 3 months')",
};

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  const client = new SixtyfourClient({ apiKey: API_KEY! });

  console.log(`\nEnriching candidate: ${CANDIDATE.full_name} @ ${CANDIDATE.company}`);
  console.log("─".repeat(60));

  const start = Date.now();

  const result = await client.peopleIntelligence({
    lead_info: {
      full_name: CANDIDATE.full_name,
      company: CANDIDATE.company,
      ...(CANDIDATE.linkedin_url ? { linkedin_url: CANDIDATE.linkedin_url } : {}),
    },
    struct: TALENT_STRUCT,
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
