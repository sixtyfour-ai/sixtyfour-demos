/**
 * Competitive Org Intel — code snippets for JS, Python, and cURL.
 *
 * Pattern: POST /company-intelligence with a competitive org-mapping struct.
 * Pass a competitor's domain; get headcount trend, leadership roster, hiring
 * signals, product launches, funding, and competitive moves in one call.
 */

export const JAVASCRIPT = `\
const SIXTYFOUR_API_KEY = process.env.SIXTYFOUR_API_KEY;

async function getCompetitiveOrgIntel(domain) {
  const response = await fetch("https://api.sixtyfour.ai/company-intelligence", {
    method: "POST",
    headers: {
      "x-api-key": SIXTYFOUR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_company: { website: domain },
      struct: {
        company_name: "Official company name",
        domain: "Primary website domain",
        headquarters: "City, state/region, country of headquarters",
        employee_count_current:
          "Most recent estimated total headcount (integer). Note source and approximate date.",
        employee_count_6mo_ago:
          "Estimated headcount ~6 months ago (integer). 'Unknown' if not determinable.",
        employee_count_12mo_ago:
          "Estimated headcount ~12 months ago (integer). 'Unknown' if not determinable.",
        headcount_trend:
          "One of: growing | shrinking | flat | unknown",
        headcount_trend_pct:
          "YoY headcount change (e.g. '+12%', '-8%'). 'Unknown' if not determinable.",
        ceo: "Current CEO — full name and LinkedIn URL. 'Unknown' if not found.",
        cto: "Current CTO or Head of Engineering — name and LinkedIn URL. 'None' if not found.",
        cpo: "Current CPO or Head of Product — name and LinkedIn URL. 'None' if not found.",
        cmo: "Current CMO or Head of Marketing — name and LinkedIn URL. 'None' if not found.",
        vp_sales: "Current VP Sales or Head of Sales — name and LinkedIn URL. 'None' if not found.",
        leadership_changes_90d:
          "C-suite or VP-level changes in last 90 days. Format: 'Name — joined/left as Title (date)'. 'None found' if none.",
        key_hires_90d:
          "Notable hires signalling strategic bets. Format: 'Name — Title (date)'. 'None found' if none.",
        layoffs_or_reductions:
          "Public layoffs or RIFs in last 12 months with date and % if known. 'None found' if absent.",
        open_roles_signals:
          "High-signal open roles revealing strategy (up to 5 examples). 'None found' if none.",
        recent_funding:
          "Most recent round: stage, amount, lead investor, date. 'None in last 12 months' if n/a.",
        product_launches_90d:
          "Notable product launches or announcements in last 90 days. 'None found' if none.",
        competitive_signals:
          "Direct competitive moves: market expansion, pricing changes, partnerships. 'None found' if absent.",
        data_sources_note:
          "Primary sources (LinkedIn, Crunchbase, press, job boards, etc.) and notable gaps.",
      },
      tier: "low",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(\`Sixtyfour API error \${response.status}: \${body}\`);
  }

  const { structured_data, confidence_score, references } = await response.json();
  return { structured_data, confidence_score, references };
}

// Example usage
const { structured_data } = await getCompetitiveOrgIntel("clay.com");
console.log(\`\${structured_data.company_name} — headcount: \${structured_data.employee_count_current} (\${structured_data.headcount_trend}, \${structured_data.headcount_trend_pct})\`);
console.log(\`CEO: \${structured_data.ceo}\`);
console.log(\`Recent product launches: \${structured_data.product_launches_90d}\`);
`;

export const PYTHON = `\
import os
import requests

SIXTYFOUR_API_KEY = os.environ["SIXTYFOUR_API_KEY"]


def get_competitive_org_intel(domain: str) -> dict:
    payload = {
        "target_company": {"website": domain},
        "struct": {
            "company_name": "Official company name",
            "domain": "Primary website domain",
            "headquarters": "City, state/region, country",
            "employee_count_current": "Most recent total headcount (integer) with source date.",
            "employee_count_6mo_ago": "Headcount ~6 months ago (integer). 'Unknown' if indeterminable.",
            "employee_count_12mo_ago": "Headcount ~12 months ago (integer). 'Unknown' if indeterminable.",
            "headcount_trend": "One of: growing | shrinking | flat | unknown",
            "headcount_trend_pct": "YoY headcount change (e.g. '+12%'). 'Unknown' if indeterminable.",
            "ceo": "Current CEO name and LinkedIn URL. 'Unknown' if not found.",
            "cto": "Current CTO or Head of Engineering. 'None' if not found.",
            "cpo": "Current CPO or Head of Product. 'None' if not found.",
            "cmo": "Current CMO or Head of Marketing. 'None' if not found.",
            "vp_sales": "Current VP Sales or Head of Sales. 'None' if not found.",
            "leadership_changes_90d": "C-suite/VP changes in last 90 days. 'None found' if none.",
            "key_hires_90d": "Notable hires signalling strategic bets. 'None found' if none.",
            "layoffs_or_reductions": "Public layoffs in last 12 months. 'None found' if absent.",
            "open_roles_signals": "High-signal open roles (up to 5). 'None found' if none.",
            "recent_funding": "Most recent round: stage, amount, lead, date.",
            "product_launches_90d": "Notable launches in last 90 days. 'None found' if none.",
            "competitive_signals": "Direct competitive moves. 'None found' if absent.",
            "data_sources_note": "Sources used and notable data gaps.",
        },
        "tier": "low",
    }

    response = requests.post(
        "https://api.sixtyfour.ai/company-intelligence",
        headers={"x-api-key": SIXTYFOUR_API_KEY, "Content-Type": "application/json"},
        json=payload,
        timeout=120,
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    result = get_competitive_org_intel("clay.com")
    data = result["structured_data"]
    print(f"{data['company_name']} — headcount: {data['employee_count_current']} ({data['headcount_trend']}, {data['headcount_trend_pct']})")
    print(f"CEO: {data['ceo']}")
    print(f"Product launches (90d): {data['product_launches_90d']}")
`;

export const CURL = `\
curl -X POST "https://api.sixtyfour.ai/company-intelligence" \\
  -H "x-api-key: $SIXTYFOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_company": { "website": "clay.com" },
    "struct": {
      "company_name": "Official company name",
      "employee_count_current": "Most recent total headcount (integer).",
      "headcount_trend": "One of: growing | shrinking | flat | unknown",
      "headcount_trend_pct": "YoY headcount change (e.g. +12%). Unknown if indeterminable.",
      "ceo": "Current CEO name and LinkedIn URL.",
      "leadership_changes_90d": "C-suite/VP changes in last 90 days. None found if none.",
      "key_hires_90d": "Notable hires signalling strategy. None found if none.",
      "open_roles_signals": "High-signal open roles (up to 5). None found if none.",
      "product_launches_90d": "Notable launches in last 90 days. None found if none.",
      "competitive_signals": "Direct competitive moves. None found if absent.",
      "data_sources_note": "Sources used and notable data gaps."
    },
    "tier": "low"
  }'
`;
