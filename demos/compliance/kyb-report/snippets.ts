/**
 * KYB Report — code snippets for JS, Python, and cURL.
 *
 * Pattern: POST /company-intelligence with a KYB due-diligence struct.
 * Pass a domain; get back ownership, sanctions, shell-company signals,
 * adverse media, and a risk verdict in one call.
 */

export const JAVASCRIPT = `\
const SIXTYFOUR_API_KEY = process.env.SIXTYFOUR_API_KEY;

async function runKybReport(domain) {
  const response = await fetch("https://api.sixtyfour.ai/company-intelligence", {
    method: "POST",
    headers: {
      "x-api-key": SIXTYFOUR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_company: { website: domain },
      struct: {
        company_name: "Official registered company name",
        registration_number: "Company registration or incorporation number (if findable)",
        jurisdiction: "Country and state/province of incorporation",
        registered_address: "Registered office address",
        operating_address: "Primary operating address if different from registered",
        company_type: "Legal entity type (LLC, C-Corp, Ltd, GmbH, etc.)",
        incorporation_date: "Date of incorporation (YYYY-MM-DD or YYYY)",
        operational_status: "Active, Dissolved, Suspended, or Unknown",
        industry: "Primary industry or vertical (1-3 words)",
        employee_count: "Estimated total employees (integer)",
        annual_revenue_estimate: "Most recent known annual revenue with source year",
        beneficial_owners:
          "Known UBOs owning >= 10%. Format: 'Name - ownership %, role'. 'None found' if absent.",
        key_executives: "Current CEO, CFO, and board chair (name + title). 'Unknown' if absent.",
        parent_company: "Immediate parent entity and jurisdiction. 'None' if independent.",
        subsidiaries: "Known subsidiaries or affiliated entities. 'None found' if none.",
        sanctions_exposure:
          "Any matches on OFAC SDN, EU consolidated, UN, or UKOF lists. 'None found' if clean.",
        pep_exposure:
          "Any executives or owners who are Politically Exposed Persons. 'None found' if clean.",
        shell_company_signals:
          "Indicators: nominee directors, no employees, virtual office, complex layers. 'None found' if absent.",
        adverse_media_summary:
          "Recent fraud, litigation, regulatory action, AML allegations. 'None found' if clean.",
        litigation_and_regulatory:
          "Active lawsuits, fines, license revocations, or regulatory investigations. 'None found' if clean.",
        risk_score: "Integer 0-100. 0 = very low risk, 100 = very high risk.",
        risk_verdict: "One of: low | medium | high | critical",
        risk_summary: "3-5 sentences summarising key findings and basis for verdict.",
        data_sources_note: "Primary sources used and any notable data gaps.",
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
const { structured_data } = await runKybReport("sixtyfour.ai");
console.log(\`\${structured_data.company_name} — risk: \${structured_data.risk_verdict} (\${structured_data.risk_score}/100)\`);
console.log(structured_data.risk_summary);
`;

export const PYTHON = `\
import os
import requests

SIXTYFOUR_API_KEY = os.environ["SIXTYFOUR_API_KEY"]


def run_kyb_report(domain: str) -> dict:
    payload = {
        "target_company": {"website": domain},
        "struct": {
            "company_name": "Official registered company name",
            "registration_number": "Company registration or incorporation number (if findable)",
            "jurisdiction": "Country and state/province of incorporation",
            "registered_address": "Registered office address",
            "operating_address": "Primary operating address if different from registered",
            "company_type": "Legal entity type (LLC, C-Corp, Ltd, GmbH, etc.)",
            "incorporation_date": "Date of incorporation (YYYY-MM-DD or YYYY)",
            "operational_status": "Active, Dissolved, Suspended, or Unknown",
            "industry": "Primary industry or vertical (1-3 words)",
            "employee_count": "Estimated total employees (integer)",
            "annual_revenue_estimate": "Most recent known annual revenue with source year",
            "beneficial_owners": "Known UBOs >= 10%. 'None found' if absent.",
            "key_executives": "CEO, CFO, board chair. 'Unknown' if absent.",
            "parent_company": "Immediate parent + jurisdiction. 'None' if independent.",
            "subsidiaries": "Known subsidiaries. 'None found' if none.",
            "sanctions_exposure": "OFAC/EU/UN/UKOF matches. 'None found' if clean.",
            "pep_exposure": "Politically Exposed Persons. 'None found' if clean.",
            "shell_company_signals": "Shell indicators. 'None found' if absent.",
            "adverse_media_summary": "Fraud, litigation, AML. 'None found' if clean.",
            "litigation_and_regulatory": "Active legal/regulatory issues. 'None found' if clean.",
            "risk_score": "Integer 0-100.",
            "risk_verdict": "One of: low | medium | high | critical",
            "risk_summary": "3-5 sentences on key findings and verdict basis.",
            "data_sources_note": "Sources used and any data gaps.",
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
    result = run_kyb_report("sixtyfour.ai")
    data = result["structured_data"]
    print(f"{data['company_name']} — risk: {data['risk_verdict']} ({data['risk_score']}/100)")
    print(data["risk_summary"])
`;

export const CURL = `\
curl -X POST "https://api.sixtyfour.ai/company-intelligence" \\
  -H "x-api-key: $SIXTYFOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_company": { "website": "sixtyfour.ai" },
    "struct": {
      "company_name": "Official registered company name",
      "jurisdiction": "Country and state/province of incorporation",
      "beneficial_owners": "Known UBOs owning >= 10%. Format: Name - ownership %, role.",
      "sanctions_exposure": "OFAC SDN, EU consolidated, UN, UKOF matches. None found if clean.",
      "pep_exposure": "Politically Exposed Persons. None found if clean.",
      "shell_company_signals": "Shell indicators. None found if absent.",
      "adverse_media_summary": "Fraud, litigation, regulatory action. None found if clean.",
      "risk_score": "Integer 0-100.",
      "risk_verdict": "One of: low | medium | high | critical",
      "risk_summary": "3-5 sentences summarising findings and verdict basis.",
      "data_sources_note": "Sources used and any data gaps."
    },
    "tier": "low"
  }'
`;
