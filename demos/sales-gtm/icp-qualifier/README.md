# ICP Qualifier

> Score any company against your Ideal Customer Profile in one Sixtyfour API call — no workflows, no provisioning, no polling.

## What it does

Pass a company `domain` and a plain-English ICP rubric. The Sixtyfour `/company-intelligence` endpoint researches the company using AI agents and returns:

- Structured company facts (industry, headcount, funding, tech stack, buyer persona, signals)
- An ICP fit score (0–100) graded against your rubric
- A verdict (`strong | moderate | weak | unfit`)
- Reasoning citing specific facts
- Source URLs the agents referenced

One POST, one response. The `struct` field is fully flexible — you define what to return and the AI agents go find it.

## What you get back

```json
{
  "company_name": "Ramp",
  "industry": "Fintech / Spend Management",
  "headquarters": "New York, NY, United States",
  "employee_count": "1800",
  "employee_count_range": "1000+",
  "annual_revenue_estimate": "$300M+ ARR (2024 estimate)",
  "funding_stage": "Series D",
  "last_funding_round": "Series D — $150M at $7.65B valuation, led by Khosla Ventures",
  "primary_buyer_persona": "CFO / VP Finance / Finance Ops",
  "tech_stack_signals": "React, TypeScript, Python, AWS, Snowflake, Plaid",
  "icp_fit_score": "72",
  "icp_verdict": "moderate",
  "icp_reasoning": "Ramp is a US-headquartered B2B fintech SaaS company with strong recent funding and a clear Finance Ops buyer persona. However, headcount (~1800) exceeds the 50–500 ceiling, and the buyer is finance-focused rather than engineering.",
  "icp_key_facts": [
    "US HQ (New York)",
    "B2B SaaS / fintech vertical",
    "Series D raised within last 24 months",
    "~1800 employees",
    "$300M+ estimated ARR"
  ],
  "icp_mismatches": [
    "Headcount ~1800 exceeds the 50–500 employee ceiling",
    "Buyer persona is finance-focused, not engineering"
  ]
}
```

A live, recorded sample is at [`sample-output.json`](sample-output.json).

## 2-minute setup

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/demos/sales-gtm/icp-qualifier

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm start       # scores TARGET_DOMAIN against ICP_DESCRIPTION
```

That's it. No provisioning, no workflow setup. One env var, one command.

## The API call, exposed

The entire integration is one `fetch` call:

```ts
const result = await fetch("https://api.sixtyfour.ai/company-intelligence", {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    target_company: { website: "ramp.com" },
    struct: {
      company_name: "Official company name",
      industry: "Primary industry (1–3 words)",
      employee_count: "Estimated total employees",
      funding_stage: "Latest funding stage",
      // ... any fields you want ...
      icp_fit_score: `Integer 0–100 scoring against: "${icp_description}"`,
      icp_verdict: "One of: strong | moderate | weak | unfit",
      icp_reasoning: "2–4 sentences explaining the score",
    },
    tier: "low",
  }),
});
const { structured_data, confidence_score, references } = await result.json();
```

The `struct` field is the magic — every key becomes a field in the response. The value is a description that guides the AI agents on what to find. You can ask for anything a human researcher could look up.

## How it works

| Component | What it does |
|---|---|
| `target_company.website` | Identifies the company to research |
| `struct` (company fields) | Tells the agent what facts to find: headcount, funding, tech stack, etc. |
| `struct` (ICP fields) | Embeds your rubric directly in the field description — the agent scores against it while researching |
| `tier: "low"` | Fast single-pass research (10–60s). Use `"medium"` for harder targets. |

The response includes `structured_data` (your fields, filled in), `confidence_score` (0–10), `references` (source URLs), and `notes` (research commentary).

## Extend this

1. **Swap the rubric without changing code** — `icp_description` is just a string in the `struct`. Different teams can score against different criteria.
2. **Batch-score companies** — loop over a list of domains, or switch to `/company-intelligence-async` for long-running research and poll with `/job-status/{task_id}`.
3. **Add more fields** — want `competitors`, `recent_press`, `glassdoor_rating`? Just add them to `struct` — the agents research whatever you ask.
4. **Build a Slack alert** — pipe results to Slack when `icp_fit_score >= 80`. The structured JSON makes it trivial to template.
5. **Use `tier: "medium"` for hard targets** — bootstrapped companies, international firms, or niche industries benefit from multi-source deep research.

## Copy this prompt to fork the demo with an LLM

> I want to build an "ICP Qualifier" using the Sixtyfour API. Here is a working JavaScript snippet:
>
> ```javascript
> // (paste contents of ./snippets.ts → JAVASCRIPT)
> ```
>
> Adapt it to my codebase. Read `SIXTYFOUR_API_KEY` from the environment. Use native `fetch`. Throw on non-2xx with the response body in the error. Then explain how I'd swap the rubric, batch 1000 domains, or add fields.

The same prompt is on the [demo site page](https://demos.sixtyfour.ai/demos/icp-qualifier) behind a "Copy prompt to build this" button.

## License

MIT — same as the rest of the monorepo.
