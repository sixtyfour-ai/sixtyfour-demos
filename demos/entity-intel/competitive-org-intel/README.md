# Competitive Org Intel

Get a structured competitive snapshot on any company in one Sixtyfour API call — headcount trend over 6 and 12 months, full leadership roster, recent leadership changes and key hires, open role signals, layoffs, product launches, funding, and direct competitive moves.

## What it does

Pass a competitor's `domain`. The Sixtyfour `/company-intelligence` endpoint researches the company using AI agents and returns:

- Headcount: current estimate, 6-month and 12-month prior estimates, trend direction, and YoY % change
- Leadership: CEO, CTO, CPO, CMO, VP Sales — name and LinkedIn URL
- People signals: C-suite/VP-level changes in the last 90 days, notable individual hires
- Job posting signals: high-signal open roles that reveal strategic bets
- Org health: any publicly reported layoffs or workforce reductions in the last 12 months
- Product signals: notable launches, major releases, or announcements in the last 90 days
- Funding: most recent round — stage, amount, lead investor, date
- Competitive signals: market expansion, pricing changes, partnerships, or competitive messaging

One POST, one response. No workflow provisioning, no polling.

## What you get back

```json
{
  "company_name": "Sixtyfour AI",
  "domain": "sixtyfour.ai",
  "headquarters": "San Francisco, CA, United States",
  "employee_count_current": "15",
  "employee_count_6mo_ago": "10",
  "employee_count_12mo_ago": "6",
  "headcount_trend": "growing",
  "headcount_trend_pct": "+150%",
  "ceo": "Saarth Shah — https://linkedin.com/in/saarthshah",
  "cto": "Not publicly listed as a distinct CTO role.",
  "cpo": "Not publicly listed.",
  "cmo": "Not publicly listed.",
  "vp_sales": "Not publicly listed.",
  "leadership_changes_90d": "None found.",
  "key_hires_90d": "Multiple engineering and GTM hires visible on LinkedIn (Apr–Jun 2026). New developer relations role added.",
  "layoffs_or_reductions": "None found.",
  "open_roles_signals": "Senior Backend Engineer; Developer Relations Engineer; GTM / Sales Engineer; Senior ML Engineer.",
  "recent_funding": "Seed — $4.1M (2024, investors not publicly disclosed).",
  "product_launches_90d": "Waterfall API (May 2026); new docs site (April 2026); open-source demos site (June 2026).",
  "competitive_signals": "Waterfall API competes with Clay, Apollo, and Clearbit in the enrichment layer. Positioning as developer-first with BYOK and transparent API design.",
  "data_sources_note": "LinkedIn, Crunchbase, sixtyfour.ai, docs.sixtyfour.ai, ProductHunt, company announcements."
}
```

## 2-minute setup

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/demos/entity-intel/competitive-org-intel

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm start       # runs a snapshot on TARGET_DOMAIN (default: sixtyfour.ai)
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
      employee_count_current: "Most recent estimated total headcount (integer).",
      employee_count_12mo_ago: "Estimated headcount ~12 months ago (integer). 'Unknown' if not determinable.",
      headcount_trend: "One of: growing | shrinking | flat | unknown",
      headcount_trend_pct: "YoY headcount change (e.g. '+12%', '-8%'). 'Unknown' if not determinable.",
      ceo: "Current CEO — full name and LinkedIn URL.",
      leadership_changes_90d: "C-suite or VP-level changes in last 90 days. 'None found' if none.",
      key_hires_90d: "Notable hires signalling strategic bets. 'None found' if none.",
      open_roles_signals: "High-signal open roles revealing strategy. Up to 5 examples.",
      product_launches_90d: "Notable product launches in last 90 days. 'None found' if none.",
      competitive_signals: "Direct competitive moves. 'None found' if absent.",
      recent_funding: "Most recent round — stage, amount, lead, date.",
    },
    tier: "low",
  }),
});
const { structured_data, confidence_score, references } = await result.json();
```

The `struct` field defines your output schema. Every key becomes a field in the response; the value guides the AI agent on what to find and how to format it.

## How it works

| Component | What it does |
|---|---|
| `target_company.website` | Identifies the company to research |
| `struct` (headcount fields) | Instructs the agent to find current and historical headcount estimates from public sources |
| `struct` (people fields) | Embeds criteria for leadership roster, changes, and hiring signals |
| `struct` (signal fields) | Captures product, funding, and competitive move signals |
| `tier: "low"` | Fast single-pass research (15–60s). Use `"medium"` for more thorough coverage of private companies. |

The response includes `structured_data` (your fields, filled in), `confidence_score` (0–10), `references` (source URLs), and `notes` (research commentary).

## Extend this

1. **Monitor a list of competitors** — loop over a list of domains, scheduling a weekly refresh via cron or `/company-intelligence-async`.
2. **Alert on changes** — compare today's result against last week's stored JSON; diff `headcount_trend`, `leadership_changes_90d`, `product_launches_90d`, and send a Slack alert when anything changes.
3. **Build a competitive dashboard** — store results in a database, visualize headcount charts over time, and surface the latest signals to your sales or product team.
4. **Combine with ICP scoring** — run both `competitive-org-intel` and `icp-qualifier` on the same domain to get competitive context alongside fit scoring for an account.
5. **Use `tier: "medium"` for private or low-profile companies** — harder targets with limited press coverage benefit from deeper multi-source research.

## Copy-for-LLM prompt

```
Build a competitive intelligence monitor using the Sixtyfour API.

POST /company-intelligence with:
- target_company: { website: "domain.com" }
- struct: {
    company_name, domain, headquarters,
    employee_count_current, employee_count_6mo_ago, employee_count_12mo_ago,
    headcount_trend, headcount_trend_pct,
    ceo, cto, cpo, vp_sales,
    leadership_changes_90d, key_hires_90d, layoffs_or_reductions,
    open_roles_signals, product_launches_90d, recent_funding,
    competitive_signals, data_sources_note
  }
- tier: "low"

The JS implementation is:

PASTE_JAVASCRIPT_SNIPPET_HERE

Extend this to:
1. Accept a list of competitor domains
2. Run all enrichments in parallel (rate-limit to 3 at a time)
3. Store each result as JSON with a timestamp
4. Diff against the previous run and print a changelog of what changed
```

## License

MIT — same as the rest of the monorepo.
