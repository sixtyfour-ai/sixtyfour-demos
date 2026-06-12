/**
 * Demo registry — single source of truth for the landing page, demo pages,
 * API routes, and provisioning script.
 *
 * Each demo declares its slug, category, marketing copy, env var name, the
 * Zod schema for its input form, and (when shipped) a path to its
 * `sample-output.json`. Adding a 7th demo means a new entry here plus a
 * new `demos/<category>/<slug>/` directory — nothing else.
 */

import { z } from "zod";

export const CATEGORIES = [
  {
    id: "sales-gtm",
    name: "Sales / GTM",
    description: "Score accounts, qualify leads, and prep your reps in seconds.",
  },
  {
    id: "talent",
    name: "Talent / Recruiting",
    description: "Source passive candidates that match a JD with structured data.",
  },
  {
    id: "compliance",
    name: "Compliance / KYB",
    description: "Generate due-diligence packets with sourced risk signals.",
  },
  {
    id: "security",
    name: "Security",
    description: "Map a person's online footprint across platforms and aliases.",
  },
  {
    id: "entity-intel",
    name: "Entity / Financial Intel",
    description: "Investigate companies, founders, and competitive landscape.",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface DemoInput {
  /** Form field name. Must match keys in the Zod schema. */
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "url" | "email" | "textarea";
  description?: string;
  defaultValue?: string;
}

export interface Demo {
  slug: string;
  title: string;
  oneLiner: string;
  category: CategoryId;
  /** When false, the card links to /coming-soon and the demo page 404s. */
  status: "live" | "coming-soon";
  mode: "direct";
  /** Human-readable tag chips on the card. */
  tags: string[];
  /** Form input fields — used to render the live demo's input UI. */
  inputs: DemoInput[];
  /** Zod schema for the form payload — enforced server-side in /api/demo/[slug]/run. */
  inputSchema: z.ZodTypeAny;
  /** Optional path (relative to the demos/ directory) for the cached sample output JSON. */
  sampleOutputPath?: string;
  /** Optional path (relative to repo root) to the standalone main.ts. */
  standalonePath?: string;
  /** Markdown-style brief explaining what gets returned. Used on the demo page. */
  outputBrief?: string;
}

const icpInputSchema = z.object({
  domain: z
    .string()
    .min(1, "domain is required")
    .max(200, "domain must be < 200 chars")
    .transform((v) => v.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase()),
  icp_description: z
    .string()
    .min(10, "describe your ICP in at least 10 chars")
    .max(2000, "icp_description must be < 2000 chars"),
});

export type IcpInput = z.infer<typeof icpInputSchema>;

export const DEMOS: Demo[] = [
  {
    slug: "icp-qualifier",
    title: "ICP Qualifier",
    oneLiner:
      "Score any company against your Ideal Customer Profile and get a sourced rationale in one call.",
    category: "sales-gtm",
    status: "live",
    mode: "direct",
    tags: ["company-intelligence", "scoring", "sync" ,"api"],
    inputs: [
      {
        name: "domain",
        label: "Company domain",
        placeholder: "sixtyfour.ai",
        type: "text",
        defaultValue: "sixtyfour.ai",
        description: "Website domain — no protocol or path.",
      },
      {
        name: "icp_description",
        label: "ICP description",
        placeholder:
          "B2B fintech, 50–500 employees, US HQ, recently raised Series B+, technical buyer in finance ops",
        type: "textarea",
        description:
          "Natural language rubric. The agent uses it as the scoring criterion.",
        defaultValue:
          "B2B SaaS companies, 50–500 employees, US HQ, Series B+ funded in the last 24 months, technical buyer in engineering or finance.",
      },
    ],
    inputSchema: icpInputSchema,
    sampleOutputPath: "sales-gtm/icp-qualifier/sample-output.json",
    standalonePath: "demos/sales-gtm/icp-qualifier",
    outputBrief:
      "A score (0–100), a fit verdict (strong / moderate / weak / unfit), the company facts that drove the score, and a list of source URLs the agent referenced.",
  },
  {
    slug: "passive-candidate-finder",
    title: "Passive Candidate Finder",
    oneLiner:
      "Enrich any person into a recruiter-ready profile: seniority, skills, career narrative, and open-to-work signals.",
    category: "talent",
    status: "live",
    mode: "direct",
    tags: ["people-intelligence", "recruiting", "sync", "api"],
    inputs: [
      {
        name: "full_name",
        label: "Full name",
        placeholder: "Saarth Shah",
        type: "text",
        defaultValue: "Saarth Shah",
        description: "First and last name.",
      },
      {
        name: "company",
        label: "Current company",
        placeholder: "Sixtyfour",
        type: "text",
        defaultValue: "Sixtyfour",
        description: "Where they work right now.",
      },
      {
        name: "linkedin_url",
        label: "LinkedIn URL (optional)",
        placeholder: "https://linkedin.com/in/sarah-chen",
        type: "url",
        description: "Adding a LinkedIn URL significantly improves match accuracy.",
      },
    ],
    inputSchema: z.object({
      full_name: z.string().min(2, "full_name is required").max(200),
      company: z.string().min(1, "company is required").max(200),
      linkedin_url: z
        .string()
        .max(500)
        .optional()
        .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
    }),
    sampleOutputPath: "talent/passive-candidate-finder/sample-output.json",
    standalonePath: "demos/talent/passive-candidate-finder",
    outputBrief:
      "A structured profile covering current role, seniority, skills, career narrative, contact signals, open-to-work indicators, and a recruiter-ready one-liner on why to reach out.",
  },
  {
    slug: "kyb-report",
    title: "KYB Report",
    oneLiner:
      "Generate a due-diligence packet on any company: ownership, sanctions exposure, shell-company signals.",
    category: "compliance",
    status: "live",
    mode: "direct",
    tags: ["company-intelligence", "compliance", "risk", "api"],
    inputs: [
      {
        name: "domain",
        label: "Company domain",
        placeholder: "sixtyfour.ai",
        type: "text",
        defaultValue: "sixtyfour.ai",
        description: "Website domain — no protocol or path.",
      },
    ],
    inputSchema: z.object({
      domain: z
        .string()
        .min(1, "domain is required")
        .max(200, "domain must be < 200 chars")
        .transform((v) =>
          v.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase(),
        ),
    }),
    sampleOutputPath: "compliance/kyb-report/sample-output.json",
    standalonePath: "demos/compliance/kyb-report",
    outputBrief:
      "A structured KYB packet covering beneficial ownership, sanctions and watchlist exposure, shell-company indicators, adverse media signals, and an overall risk verdict with sourced reasoning.",
  },
  {
    slug: "threat-actor-footprint",
    title: "Threat Actor Footprint",
    oneLiner:
      "Map a person's online footprint across platforms, forums, and leaked credential databases.",
    category: "security",
    status: "coming-soon",
    mode: "direct",
    tags: ["search", "enrich_person", "OSINT"],
    inputs: [],
    inputSchema: z.object({}),
  },
  {
    slug: "founder-background-check",
    title: "Founder Background Check",
    oneLiner:
      "Investigate a founder: prior companies, investor relationships, red flags — sourced and structured.",
    category: "entity-intel",
    status: "coming-soon",
    mode: "direct",
    tags: ["enrich_person", "enrich_company", "due-diligence"],
    inputs: [],
    inputSchema: z.object({}),
  },
  {
    slug: "competitive-org-intel",
    title: "Competitive Org Intel",
    oneLiner:
      "Track headcount trend, leadership changes, and key hires at any competitor — refreshable on demand.",
    category: "entity-intel",
    status: "coming-soon",
    mode: "direct",
    tags: ["enrich_company", "transform"],
    inputs: [],
    inputSchema: z.object({}),
  },
];

export function getDemoBySlug(slug: string): Demo | undefined {
  return DEMOS.find((d) => d.slug === slug);
}

export function getDemosByCategory(categoryId: CategoryId): Demo[] {
  return DEMOS.filter((d) => d.category === categoryId);
}

export function getRelatedDemos(demo: Demo, limit = 2): Demo[] {
  return DEMOS.filter((d) => d.category === demo.category && d.slug !== demo.slug).slice(
    0,
    limit,
  );
}
