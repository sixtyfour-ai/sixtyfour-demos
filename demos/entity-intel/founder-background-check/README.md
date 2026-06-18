# Founder Background Check

Generate a structured due-diligence profile on any founder in one Sixtyfour API call — prior ventures and outcomes, funding and exit history, key investors, board and advisory roles, reputation signals, controversies, legal issues, and an overall background verdict with sourced reasoning.

## What it does

Pass a founder's `full_name` and their `company` (to disambiguate common names). The Sixtyfour `/people-intelligence` endpoint researches the person using AI agents and returns:

- Identity and role: confirmed name, current title and company, LinkedIn URL
- Venture history: all companies founded or co-founded, with outcomes (active / acquired / shutdown / failed)
- Funding and exit history: rounds raised across all ventures, key investors, acquisitions or IPOs
- Prior executive roles: senior leadership positions held outside founding roles
- Reputation signals: press coverage, talks, publications, awards
- Red flags: controversies, failed ventures with notable circumstances, legal or regulatory issues
- An overall background verdict (`clean | notable_concerns | significant_red_flags`)
- A background summary citing specific findings
- Source URLs the agents referenced

One POST, one response. No workflow provisioning, no polling.

## What you get back

```json
{
  "full_name": "Saarth Shah",
  "current_role": "CEO and Co-Founder at Sixtyfour AI",
  "prior_companies_founded": "Sixtyfour AI (2023–present, Active)",
  "prior_executive_roles": "None found — Sixtyfour AI is the founder's primary venture.",
  "total_capital_raised": "~$4.1M across Sixtyfour AI (Seed round, 2023–2024)",
  "funding_history": "Sixtyfour AI — Seed $4.1M (2024, Investors undisclosed publicly)",
  "key_investors": "Early-stage VC investors — specific names not publicly disclosed as of research date.",
  "exit_history": "None found — all ventures remain active.",
  "board_and_advisor_roles": "None found publicly.",
  "education": "Unknown — not publicly disclosed.",
  "linkedin_url": "https://linkedin.com/in/saarthshah",
  "media_and_press": "TechCrunch: 'Sixtyfour AI raises $4.1M to build data enrichment APIs' (2024).",
  "reputation_signals": "Active on LinkedIn with posts on developer tooling; product featured on ProductHunt (2024).",
  "controversies_or_red_flags": "None found.",
  "legal_or_regulatory_issues": "None found.",
  "background_verdict": "clean",
  "background_summary": "Saarth Shah is the CEO and co-founder of Sixtyfour AI with no prior founding history and no adverse signals in public records. The profile is clean with limited history to evaluate, consistent with an early-stage founder.",
  "data_sources_note": "LinkedIn, Crunchbase, TechCrunch, ProductHunt, company website. Limited public information for early-stage private company."
}
```

## 2-minute setup

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/demos/entity-intel/founder-background-check

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm start       # runs a background check on TARGET_NAME (default: Saarth Shah)
```

That's it. One env var, one command.

## The API call, exposed

```ts
const result = await fetch("https://api.sixtyfour.ai/people-intelligence", {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    lead_info: {
      full_name: "Saarth Shah",
      company: "Sixtyfour",
    },
    struct: {
      current_role: "Current title and company.",
      prior_companies_founded:
        "Companies this person founded. Format: 'Company (Year–Year, Outcome)'. 'None found' if none.",
      funding_history:
        "Funding rounds raised across ventures. Format: 'Company — Stage $Amount (Year, Lead Investor)'. 'None found' if none.",
      key_investors: "Notable investors who backed this person's ventures. 'None found' if absent.",
      exit_history:
        "Acquisitions, IPOs, or shutdowns. Format: 'Company — Outcome (Year)'. 'None found' if absent.",
      controversies_or_red_flags:
        "Public controversies, disputed failures, or negative press. 'None found' if absent.",
      legal_or_regulatory_issues:
        "Court records, SEC filings, enforcement actions. 'None found' if absent.",
      background_verdict: "One of: clean | notable_concerns | significant_red_flags",
      background_summary: "3–5 sentences summarising key findings and basis for the verdict.",
    },
    tier: "low",
  }),
});
const { structured_data, confidence_score, references } = await result.json();
```

The `struct` field defines your output schema. Every key becomes a field in the response; the value is a description that guides the AI agent on what to find and how to format it.

## How it works

| Component | What it does |
|---|---|
| `lead_info.full_name` + `company` | Identifies and disambiguates the person |
| `lead_info.linkedin_url` | Optional — anchors identity resolution, significantly improves coverage |
| `struct` (history fields) | Instructs the agent to research venture history, funding, and exits |
| `struct` (risk fields) | Embeds due-diligence criteria — controversies, legal issues, red flag patterns |
| `tier: "low"` | Fast single-pass research (15–60s). Use `"medium"` for harder targets or founders with limited online presence. |

The response includes `structured_data` (your fields, filled in), `confidence_score` (0–10), `references` (source URLs), and `notes` (research commentary).

## Extend this

1. **Screen a batch of founders** — loop over a list of names, or use `/people-intelligence-async` + `/job-status/{task_id}` for long-running research.
2. **Add investor-specific fields** — need carried interest history, fund affiliations, or LP relationships? Add them to `struct`.
3. **Plug into deal flow** — trigger a background check when a new founder enters your CRM, store the verdict, and flag `notable_concerns` or `significant_red_flags` for manual review.
4. **Combine with KYB** — pair this script with `demos/compliance/kyb-report` to get both a founder profile and a company due-diligence packet in two parallel API calls.
5. **Use `tier: "medium"` for private founders** — founders with limited online presence or non-English press coverage benefit from deeper multi-source research.

## License

MIT — same as the rest of the monorepo.
