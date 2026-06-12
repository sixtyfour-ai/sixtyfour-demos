# KYB Report

Generate a Know Your Business due-diligence packet on any company in one Sixtyfour API call — ownership structure, sanctions exposure, shell-company signals, adverse media, and an overall risk verdict with sourced reasoning.

## What it does

Pass a company `domain`. The Sixtyfour `/company-intelligence` endpoint researches the company using AI agents and returns:

- Registration details: jurisdiction, incorporation date, legal entity type, operational status
- Ownership: beneficial owners (UBOs ≥ 10%), key executives, parent company, subsidiaries
- Risk signals: OFAC/EU/UN sanctions matches, PEP exposure, shell-company indicators, adverse media, litigation
- An overall risk score (0–100) and verdict (`low | medium | high | critical`)
- A risk summary citing specific findings
- Source URLs the agents referenced

One POST, one response. No workflow provisioning, no polling.

## What you get back

```json
{
  "company_name": "Sixtyfour AI, Inc.",
  "registration_number": "Unknown — private company",
  "jurisdiction": "United States — Delaware",
  "registered_address": "Not publicly disclosed",
  "operating_address": "San Francisco, CA, United States",
  "company_type": "C-Corp",
  "incorporation_date": "2023",
  "operational_status": "Active",
  "industry": "Data enrichment / AI",
  "employee_count": "~15",
  "annual_revenue_estimate": "Not publicly disclosed — early-stage startup",
  "beneficial_owners": "Founders — exact ownership percentages not publicly disclosed",
  "key_executives": "Saarth Shah (CEO). Other executives not publicly listed.",
  "parent_company": "None — independent",
  "subsidiaries": "None found",
  "sanctions_exposure": "None found",
  "pep_exposure": "None found",
  "shell_company_signals": "None found — operational startup with known product and customers",
  "adverse_media_summary": "None found — no fraud, regulatory action, or adverse press",
  "litigation_and_regulatory": "None found",
  "risk_score": "5",
  "risk_verdict": "low",
  "risk_summary": "Sixtyfour AI is a small, early-stage US AI startup with no adverse signals. The low score reflects the limited public information available for a private company of this size, not any specific red flag.",
  "data_sources_note": "Delaware SOS, Crunchbase, LinkedIn, OFAC SDN list, company website, press sources. Limited public financials available for private company."
}
```

## 2-minute setup

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/demos/compliance/kyb-report

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm start       # runs a KYB check on TARGET_DOMAIN (default: sixtyfour.ai)
```

That's it. One env var, one command.

## The API call, exposed

```ts
const result = await fetch("https://api.sixtyfour.ai/company-intelligence", {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    target_company: { website: "sixtyfour.ai" },
    struct: {
      company_name: "Official registered company name",
      jurisdiction: "Country and state/province of incorporation",
      beneficial_owners:
        "Known UBOs owning >= 10%. Format: 'Name – ownership %, role'. 'None found' if not identified.",
      sanctions_exposure:
        "Any matches on OFAC SDN, EU consolidated, UN, or UKOF lists. 'None found' if clean.",
      shell_company_signals:
        "Indicators: nominee directors, no employees, virtual office, complex layers. 'None found' if absent.",
      adverse_media_summary:
        "Recent fraud, litigation, regulatory action, AML allegations. 'None found' if clean.",
      risk_score: "Integer 0–100. 0 = very low risk, 100 = very high risk.",
      risk_verdict: "One of: low | medium | high | critical",
      risk_summary: "3–5 sentences summarising key findings and basis for the verdict.",
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
| `target_company.website` | Identifies the company to research |
| `struct` (identity fields) | Instructs the agent to find registration details, address, entity type |
| `struct` (risk fields) | Embeds the screening criteria directly — sanctions lists, PEP definitions, shell-company patterns |
| `tier: "low"` | Fast single-pass research (10–60s). Use `"medium"` for harder targets or private companies. |

The response includes `structured_data` (your fields, filled in), `confidence_score` (0–10), `references` (source URLs), and `notes` (research commentary).

## Extend this

1. **Screen a batch of counterparties** — loop over a list of domains, or switch to `/company-intelligence-async` for long-running research and poll with `/job-status/{task_id}`.
2. **Add jurisdiction-specific fields** — need Companies House number, GLEIF LEI, or EU VAT ID? Add them to `struct`; the agent looks them up.
3. **Plug into onboarding** — trigger a KYB check at account creation, store the result in your CRM, and flag anything above a `medium` verdict for manual review.
4. **Continuous monitoring** — re-run checks on a schedule. Sanctions lists update daily; a counterparty clean today can appear tomorrow.
5. **Use `tier: "medium"` for private companies** — unlisted firms, offshore entities, and complex holding structures benefit from multi-source deep research.

## Copy-for-LLM prompt

```
Build a KYB (Know Your Business) due-diligence tool using the Sixtyfour API.

POST /company-intelligence with:
- target_company: { website: "domain.com" }
- struct: {
    company_name, registration_number, jurisdiction, registered_address,
    company_type, incorporation_date, operational_status, beneficial_owners,
    key_executives, parent_company, subsidiaries,
    sanctions_exposure, pep_exposure, shell_company_signals,
    adverse_media_summary, litigation_and_regulatory,
    risk_score, risk_verdict, risk_summary, data_sources_note
  }
- tier: "low"

The JS implementation is:

PASTE_JAVASCRIPT_SNIPPET_HERE

Extend this to:
1. Accept a CSV of company domains
2. Screen each company concurrently (rate-limit to 5 at a time)
3. Write results to a new CSV with all struct fields as columns
4. Flag any row where risk_verdict is "high" or "critical" for manual review
```

## License

MIT — same as the rest of the monorepo.
