/**
 * Code snippets shown on the demo page (and exposed for the Copy-for-LLM button).
 *
 * The ICP Qualifier uses a single POST /company-intelligence call — no
 * workflows, no polling, no provisioning. The struct field defines both
 * what company data to return AND how to score it against the ICP rubric.
 */

export const JAVASCRIPT = `// ICP Qualifier — score one company against your ICP rubric.
// Single API call. No workflow setup needed.
// Run: SIXTYFOUR_API_KEY=... node icp.mjs

const API_KEY = process.env.SIXTYFOUR_API_KEY;
const BASE = "https://api.sixtyfour.ai";

const domain = "ramp.com";
const icp = "B2B SaaS, 50-500 employees, US HQ, Series B+ funded, technical buyer in eng or finance.";

const res = await fetch(\`\${BASE}/company-intelligence\`, {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    target_company: { website: domain },
    struct: {
      company_name: "Official company name",
      industry: "Primary industry (1-3 words)",
      headquarters: "City, state, country",
      employee_count: "Estimated total employees",
      funding_stage: "Latest funding stage",
      last_funding_round: "Most recent round: name, amount, lead investor",
      annual_revenue_estimate: "Most recent known ARR with source",
      tech_stack_signals: "Notable technologies (3-6 items)",
      primary_buyer_persona: "Primary buyer role (CTO, VP Eng, CFO, etc.)",
      icp_fit_score: \`Integer 0-100 scoring against: "\${icp}"\`,
      icp_verdict: "One of: strong | moderate | weak | unfit",
      icp_reasoning: "2-4 sentences explaining score with specific facts",
      icp_key_facts: "5-8 bullet strings of relevant facts",
      icp_mismatches: "ICP criteria the company fails. 'none' if perfect."
    },
    tier: "low"
  }),
});

if (!res.ok) throw new Error(\`Failed: \${res.status} \${await res.text()}\`);
const { structured_data, confidence_score, references } = await res.json();

console.log(JSON.stringify(structured_data, null, 2));
console.log(\`Confidence: \${confidence_score}/10\`);
`;

export const PYTHON = `# ICP Qualifier — score one company against your ICP rubric.
# Single API call. No workflow setup needed.
import json, os, requests

API_KEY = os.environ["SIXTYFOUR_API_KEY"]
BASE = "https://api.sixtyfour.ai"

domain = "ramp.com"
icp = "B2B SaaS, 50-500 employees, US HQ, Series B+ funded, technical buyer in eng or finance."

res = requests.post(
    f"{BASE}/company-intelligence",
    headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
    json={
        "target_company": {"website": domain},
        "struct": {
            "company_name": "Official company name",
            "industry": "Primary industry (1-3 words)",
            "headquarters": "City, state, country",
            "employee_count": "Estimated total employees",
            "funding_stage": "Latest funding stage",
            "last_funding_round": "Most recent round: name, amount, lead investor",
            "annual_revenue_estimate": "Most recent known ARR with source",
            "tech_stack_signals": "Notable technologies (3-6 items)",
            "primary_buyer_persona": "Primary buyer role (CTO, VP Eng, CFO, etc.)",
            "icp_fit_score": f'Integer 0-100 scoring against: "{icp}"',
            "icp_verdict": "One of: strong | moderate | weak | unfit",
            "icp_reasoning": "2-4 sentences explaining score with specific facts",
            "icp_key_facts": "5-8 bullet strings of relevant facts",
            "icp_mismatches": "ICP criteria the company fails. 'none' if perfect.",
        },
        "tier": "low",
    },
)
res.raise_for_status()
data = res.json()

print(json.dumps(data["structured_data"], indent=2))
print(f"Confidence: {data.get('confidence_score')}/10")
`;

export const CURL = `#!/usr/bin/env bash
# ICP Qualifier — score one company against your ICP rubric.
# Single API call. No workflow setup needed.
set -euo pipefail
: "\${SIXTYFOUR_API_KEY:?set SIXTYFOUR_API_KEY}"

DOMAIN="ramp.com"
ICP="B2B SaaS, 50-500 employees, US HQ, Series B+ funded, technical buyer in eng or finance."

curl -s -X POST "https://api.sixtyfour.ai/company-intelligence" \\
  -H "x-api-key: $SIXTYFOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "$(cat <<EOF
{
  "target_company": {"website": "$DOMAIN"},
  "struct": {
    "company_name": "Official company name",
    "industry": "Primary industry (1-3 words)",
    "headquarters": "City, state, country",
    "employee_count": "Estimated total employees",
    "funding_stage": "Latest funding stage",
    "last_funding_round": "Most recent round: name, amount, lead investor",
    "annual_revenue_estimate": "Most recent known ARR with source",
    "tech_stack_signals": "Notable technologies (3-6 items)",
    "primary_buyer_persona": "Primary buyer role",
    "icp_fit_score": "Integer 0-100 scoring against: \\"$ICP\\"",
    "icp_verdict": "One of: strong | moderate | weak | unfit",
    "icp_reasoning": "2-4 sentences explaining score",
    "icp_key_facts": "5-8 bullet strings of relevant facts",
    "icp_mismatches": "ICP criteria the company fails"
  },
  "tier": "low"
}
EOF
)" | jq .
`;
