# Passive Candidate Finder

Turn a name and company into a recruiter-ready profile in one API call. Sixtyfour's research agent returns seniority, skills, career narrative, contact signals, and open-to-work indicators — structured exactly the way your ATS or outreach tool needs them.

## What you get back

```json
{
  "current_title": "Staff Software Engineer",
  "current_company": "Vercel",
  "seniority_level": "Staff IC",
  "years_experience": 11,
  "key_skills": "TypeScript, React, Next.js, distributed systems, API design",
  "tech_stack": "TypeScript, Rust, Go, PostgreSQL, Redis, Kubernetes",
  "career_summary": "Staff engineer with 11 years of experience, currently leading the edge runtime team at Vercel. Previously built payments infrastructure at Stripe...",
  "notable_achievements": [
    "Led migration of Vercel's edge runtime — reduced cold-start latency by 40%",
    "At Stripe, owned the idempotency layer handling >$1B/day"
  ],
  "education": "BS Computer Science, University of Washington (2013)",
  "linkedin_url": "https://linkedin.com/in/example",
  "email": "s.chen@vercel.com",
  "open_to_work_signals": "Posted a thread on X in April 2026 about exploring new opportunities...",
  "recruiter_note": "Rare combination of deep systems experience and modern frontend expertise.",
  "last_company_tenure": "2 years 8 months"
}
```

## 2-minute setup

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/demos/talent/passive-candidate-finder
cp .env.example .env
# paste your SIXTYFOUR_API_KEY into .env

pnpm install
pnpm start
```

## The API call, exposed

One `POST /people-intelligence` request. No SDK magic hiding what's happening:

```typescript
const response = await fetch("https://api.sixtyfour.ai/people-intelligence", {
  method: "POST",
  headers: {
    "x-api-key": process.env.SIXTYFOUR_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    lead_info: {
      full_name: "Sarah Chen",
      company: "Vercel",
      linkedin_url: "https://linkedin.com/in/sarah-chen", // optional
    },
    struct: {
      current_title: "Current job title",
      seniority_level: "One of: IC, Senior IC, Staff, Principal, Manager, Director, VP, C-level",
      key_skills: "5-8 technical skills, comma-separated",
      open_to_work_signals: "Any public signals of job-seeking activity",
      recruiter_note: "One sentence: what makes this person worth reaching out to",
      // ...add any fields you need
    },
    tier: "low",
  }),
});

const { structured_data } = await response.json();
```

**`lead_info`** — pass as many identifiers as you have. `full_name` + `company` is the minimum. `linkedin_url` or `email` significantly improves match accuracy.

**`struct`** — define any fields you want. The AI agent fills them in. There's no fixed schema — describe the field and the agent figures out how to find it.

**`tier`** controls research depth:
- `low` (default) — fast single-pass, 10–60s. Good for standard fields on people with clear online presence.
- `medium` — multi-source deep research, 30–3min. Use for common names or hard-to-find profiles.
- `high` — exhaustive OSINT-grade investigation. Enterprise access required.

## How this works

Unlike a database lookup, Sixtyfour's agent actively researches the web. It cross-references LinkedIn, GitHub, company websites, press mentions, and social profiles to fill in your `struct` fields. The `open_to_work_signals` field is particularly useful — the agent looks for subtle signals like recent social posts, profile updates, and tenure gaps that indicate someone might be open to a conversation.

## Extend this

**Batch 100 candidates from a CSV:**
```typescript
import { parse } from "csv-parse/sync";
const leads = parse(fs.readFileSync("leads.csv"), { columns: true });
const profiles = await Promise.all(
  leads.map(({ name, company }) => enrichCandidate(name, company))
);
```

**Add a "fit for role" field to your struct:**
```typescript
struct: {
  // ...existing fields...
  fit_for_senior_backend_role:
    "Yes/No + one sentence rationale: does this person have 5+ years of backend experience with distributed systems?",
}
```

**Pipe results into your ATS:**
Once you have `structured_data`, it maps directly to standard ATS fields. Use the `email` field to look up or create the contact, then update with skills, seniority, and the recruiter note.

**Trigger on LinkedIn profile views:**
Set up a Zapier/Make trigger on "new LinkedIn connection" or "profile saved" → call this API → write to your CRM. Every prospect you look at gets auto-enriched.

## Copy-for-LLM prompt

```
Build a passive candidate enrichment tool using the Sixtyfour API.

POST /people-intelligence with:
- lead_info: { full_name, company, linkedin_url (optional) }
- struct: { current_title, seniority_level, years_experience, key_skills,
            tech_stack, career_summary, notable_achievements, education,
            linkedin_url, email, open_to_work_signals, recruiter_note,
            last_company_tenure }
- tier: "low"

The JS implementation is:

PASTE_JAVASCRIPT_SNIPPET_HERE

Extend this to:
1. Accept a CSV of names/companies
2. Enrich each person concurrently (rate-limit to 5 at a time)
3. Write results to a new CSV with all struct fields as columns
4. Add a "fit score" field to the struct for a specific role requirement I'll describe
```
