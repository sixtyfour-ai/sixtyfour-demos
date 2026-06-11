import { SixtyfourClient } from "@sixtyfour-demos/api-client";

/**
 * Server-only Sixtyfour helpers.
 *
 * NEVER import this module from a Client Component or any code that ends
 * up bundled for the browser.
 *
 * Key resolution order:
 *   1. `apiKey` argument — passed from the request body (BYOK / hosted site)
 *   2. `SIXTYFOUR_API_KEY` env var — used when running locally via `pnpm dev`
 *
 * This means the hosted site at demos.sixtyfour.ai never needs a server-side
 * API key; each visitor supplies their own. Local dev still works with a
 * .env file for convenience.
 */

export class ServerConfigError extends Error {}

export function getSixtyfourClient(apiKey?: string): SixtyfourClient {
  const key = apiKey ?? process.env.SIXTYFOUR_API_KEY;
  if (!key || key.length === 0) {
    throw new ServerConfigError(
      "No API key provided. Add your Sixtyfour API key in the settings panel, or set SIXTYFOUR_API_KEY in .env for local development.",
    );
  }
  return new SixtyfourClient({
    apiKey: key,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });
}

/**
 * Build the people-intelligence `struct` for passive candidate enrichment.
 */
export function buildTalentStruct(): Record<string, string> {
  return {
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
}

/**
 * Build the company-intelligence `struct` for ICP scoring.
 */
export function buildIcpStruct(_icpDescription: string): Record<string, string> {
  return {
    company_name: "Official company name",
    industry: "Primary industry or vertical (1–3 words)",
    headquarters: "City, state/region, country of headquarters",
    employee_count: "Estimated total employees (integer)",
    employee_count_range: "Headcount bucket (e.g. '50-200', '200-500', '500-1000', '1000+')",
    annual_revenue_estimate: "Most recent known ARR or annual revenue with source year",
    funding_stage: "Latest funding stage (Seed, Series A, B, C, D+, Public, Bootstrapped)",
    last_funding_round: "Most recent round: name, amount, lead investor",
    last_funding_date: "Date of last funding (YYYY-MM-DD or YYYY)",
    primary_buyer_persona: "Primary buyer role at the company (CTO, VP Eng, CFO, etc.)",
    tech_stack_signals: "Notable technologies in use (3–6 items)",
    key_products_or_services: "What the company sells — one sentence",
    target_market: "Who they sell to / their ICP",
    notable_signals: "Recent activity (launch, hire, layoff, fundraise) in last 90 days",
    icp_fit_score:
      `Integer 0–100 scoring this company against the following ICP rubric: "${_icpDescription.replace(/"/g, '\\"')}". A score >= 75 is "strong", 50-74 "moderate", 25-49 "weak", < 25 "unfit".`,
    icp_verdict: "One of: strong | moderate | weak | unfit",
    icp_reasoning:
      "2–4 sentences explaining the fit score, citing specific company facts from above",
    icp_key_facts: "5–8 bullet strings of company facts most relevant to the rubric",
    icp_mismatches: "ICP criteria the company fails to meet. 'none' if perfect fit.",
  };
}
