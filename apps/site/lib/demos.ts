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
    label: "Sales · GTM",
    description: "Score accounts, qualify leads, and prep your reps in seconds.",
  },
  {
    id: "talent",
    name: "Talent / Recruiting",
    label: "Talent · Recruiting",
    description: "Source passive candidates that match a JD with structured data.",
  },
  {
    id: "compliance",
    name: "Compliance / KYB",
    label: "Compliance · KYB",
    description: "Generate due-diligence packets with sourced risk signals.",
  },
  {
    id: "security",
    name: "Security",
    label: "Security",
    description: "Map a person's online footprint across platforms and aliases.",
  },
  {
    id: "entity-intel",
    name: "Entity / Financial Intel",
    label: "Entity · Financial Intel",
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
  /** Optional promotional CTA shown below the live demo panel. */
  ctaNote?: {
    text: string;
    linkLabel: string;
    linkHref: string;
  };
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
    status: "live",
    mode: "direct",
    tags: ["people-intelligence", "OSINT", "security", "api"],
    inputs: [
      {
        name: "full_name",
        label: "Full name",
        placeholder: "Saarth Shah",
        type: "text",
        defaultValue: "Saarth Shah",
        description: "First and last name of the subject.",
      },
      {
        name: "email",
        label: "Known email (optional)",
        placeholder: "saarth@sixtyfour.ai",
        type: "email",
        description: "Known email address significantly improves match accuracy.",
      },
      {
        name: "linkedin_url",
        label: "LinkedIn URL (optional)",
        placeholder: "https://linkedin.com/in/saarthshah",
        type: "url",
        description: "Confirmed profile URL anchors identity resolution.",
      },
    ],
    inputSchema: z.object({
      full_name: z.string().min(2, "full_name is required").max(200),
      email: z
        .string()
        .max(500)
        .transform((v) => v.trim())
        .pipe(z.union([z.literal(""), z.string().email("must be a valid email address")]))
        .transform((v) => (v.length > 0 ? v : undefined)),
      linkedin_url: z
        .string()
        .max(500)
        .transform((v) => v.trim())
        .pipe(z.union([z.literal(""), z.string().url("must be a valid URL")]))
        .transform((v) => (v.length > 0 ? v : undefined)),
    }),
    sampleOutputPath: "security/threat-actor-footprint/sample-output.json",
    standalonePath: "demos/security/threat-actor-footprint",
    outputBrief:
      "A structured OSINT footprint covering confirmed identities and aliases, social platform presence, dark web and credential leak exposure, threat actor signals, and an overall risk verdict with sourced reasoning.",
    ctaNote: {
      text: "This demo runs on Low tier for speed and reliability. Medium tier adds extended enrichment, and High tier delivers the deepest OSINT coverage — full credential leak scanning, dark web forum indexing, and exhaustive alias resolution. High tier is available to Enterprise customers only.",
      linkLabel: "Learn about High Tier →",
      linkHref: "https://docs.sixtyfour.ai/guides/credits-and-pricing#intelligence-pricing",
    },
  },
  {
    slug: "founder-background-check",
    title: "Founder Background Check",
    oneLiner:
      "Investigate a founder: prior companies, investor relationships, red flags — sourced and structured.",
    category: "entity-intel",
    status: "live",
    mode: "direct",
    tags: ["people-intelligence", "due-diligence", "sync", "api"],
    inputs: [
      {
        name: "full_name",
        label: "Founder full name",
        placeholder: "Saarth Shah",
        type: "text",
        defaultValue: "Saarth Shah",
        description: "First and last name of the founder to investigate.",
      },
      {
        name: "company",
        label: "Current company",
        placeholder: "Sixtyfour",
        type: "text",
        defaultValue: "Sixtyfour",
        description: "Their current or most recent company — disambiguates common names.",
      },
      {
        name: "linkedin_url",
        label: "LinkedIn URL (optional)",
        placeholder: "https://linkedin.com/in/saarthshah",
        type: "url",
        description: "Confirmed profile URL anchors identity and significantly improves coverage.",
      },
    ],
    inputSchema: z.object({
      full_name: z.string().min(2, "full_name is required").max(200),
      company: z.string().min(1, "company is required").max(200),
      linkedin_url: z
        .string()
        .max(500)
        .transform((v) => v.trim())
        .pipe(z.union([z.literal(""), z.string().url("must be a valid URL")]))
        .transform((v) => (v.length > 0 ? v : undefined)),
    }),
    sampleOutputPath: "entity-intel/founder-background-check/sample-output.json",
    standalonePath: "demos/entity-intel/founder-background-check",
    outputBrief:
      "A structured due-diligence profile covering prior ventures (with outcomes), funding and exit history, key investors, board roles, reputation signals, controversies or red flags, legal or regulatory issues, and an overall background verdict with sourced reasoning.",
    ctaNote: {
      text: "This demo runs on Low tier for speed. Medium and High tiers add deeper research coverage — extended press archives, fuller public records, and harder-to-find private company data. High tier is available to Enterprise customers only.",
      linkLabel: "Learn about tiers →",
      linkHref: "https://docs.sixtyfour.ai/guides/credits-and-pricing#intelligence-pricing",
    },
  },
  {
    slug: "competitive-org-intel",
    title: "Competitive Org Intel",
    oneLiner:
      "Track headcount trend, leadership changes, and key hires at any competitor — refreshable on demand.",
    category: "entity-intel",
    status: "live",
    mode: "direct",
    tags: ["company-intelligence", "competitive", "sync", "api"],
    inputs: [
      {
        name: "domain",
        label: "Competitor domain",
        placeholder: "sixtyfour.ai",
        type: "text",
        defaultValue: "sixtyfour.ai",
        description: "Website domain of the company to monitor — no protocol or path.",
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
    sampleOutputPath: "entity-intel/competitive-org-intel/sample-output.json",
    standalonePath: "demos/entity-intel/competitive-org-intel",
    outputBrief:
      "A structured competitive snapshot covering current headcount and 6/12-month trend, C-suite and VP roster, recent leadership changes and key hires, open role signals, layoffs, product launches, recent funding, and direct competitive moves — all in one API call.",
  },
];

export function getDemoBySlug(slug: string): Demo | undefined {
  return DEMOS.find((d) => d.slug === slug);
}
