/**
 * Founder Background Check — code snippets for JS, Python, and cURL.
 *
 * Pattern: POST /people-intelligence with a due-diligence struct.
 * Pass a founder's name and company; get prior ventures, funding history,
 * exit record, red flags, and a background verdict in one call.
 */

export const JAVASCRIPT = `\
const SIXTYFOUR_API_KEY = process.env.SIXTYFOUR_API_KEY;

async function runFounderBackgroundCheck({ fullName, company, linkedinUrl }) {
  const response = await fetch("https://api.sixtyfour.ai/people-intelligence", {
    method: "POST",
    headers: {
      "x-api-key": SIXTYFOUR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lead_info: {
        full_name: fullName,
        company: company,
        ...(linkedinUrl && { linkedin_url: linkedinUrl }),
      },
      struct: {
        full_name: "Confirmed full legal name",
        current_role: "Current title and company. 'Unknown' if not determinable.",
        prior_companies_founded:
          "Companies founded or co-founded. Format: 'Company (Year-Year, Outcome: active/acquired/shutdown/failed)'. 'None found' if none.",
        prior_executive_roles:
          "Senior leadership (VP, C-suite) outside founding roles. Format: 'Title at Company (Year-Year)'. 'None found' if none.",
        total_capital_raised:
          "Aggregate capital raised across all ventures (best estimate with source). 'Unknown' if indeterminable.",
        funding_history:
          "Individual rounds across ventures. Format: 'Company - Stage $Amount (Year, Lead Investor)'. 'None found' if none.",
        key_investors:
          "Notable investors or funds who backed this person's ventures. 'None found' if absent.",
        exit_history:
          "Acquisitions, IPOs, shutdowns. Format: 'Company - Outcome (Year, Acquirer)'. 'None found' if absent.",
        board_and_advisor_roles:
          "Board seats or advisor roles at other companies. 'None found' if absent.",
        education: "Highest degree and institution. 'Unknown' if not publicly findable.",
        linkedin_url: "Confirmed LinkedIn profile URL. 'Not found' if absent.",
        media_and_press:
          "Notable press coverage or profiles (publication + year). 'None found' if absent.",
        reputation_signals:
          "Talks, podcast appearances, published writing, awards. 'None found' if absent.",
        controversies_or_red_flags:
          "Public controversies, disputed failures, or negative press. 'None found' if absent.",
        legal_or_regulatory_issues:
          "Court records, SEC filings, enforcement actions. 'None found' if absent.",
        background_verdict: "One of: clean | notable_concerns | significant_red_flags",
        background_summary: "3-5 sentences on key findings and basis for verdict.",
        data_sources_note:
          "Sources used (LinkedIn, Crunchbase, press, SEC EDGAR, etc.) and any data gaps.",
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
const { structured_data } = await runFounderBackgroundCheck({
  fullName: "Saarth Shah",
  company: "Sixtyfour",
  linkedinUrl: "https://linkedin.com/in/saarthshah",
});
console.log(\`\${structured_data.full_name} (\${structured_data.current_role}) — \${structured_data.background_verdict}\`);
console.log(structured_data.background_summary);
`;

export const PYTHON = `\
import os
import requests

SIXTYFOUR_API_KEY = os.environ["SIXTYFOUR_API_KEY"]


def run_founder_background_check(
    full_name: str,
    company: str,
    linkedin_url: str = None,
) -> dict:
    lead_info = {"full_name": full_name, "company": company}
    if linkedin_url:
        lead_info["linkedin_url"] = linkedin_url

    payload = {
        "lead_info": lead_info,
        "struct": {
            "full_name": "Confirmed full legal name",
            "current_role": "Current title and company. 'Unknown' if indeterminable.",
            "prior_companies_founded": "Companies founded. Format: Company (Year-Year, Outcome). None found if none.",
            "prior_executive_roles": "Senior leadership outside founding. Format: Title at Company (Year-Year). None found if none.",
            "total_capital_raised": "Aggregate capital raised. Unknown if indeterminable.",
            "funding_history": "Funding rounds. Format: Company - Stage $Amount (Year, Lead). None found if none.",
            "key_investors": "Notable investors. None found if absent.",
            "exit_history": "Acquisitions, IPOs, shutdowns. Format: Company - Outcome (Year). None found if absent.",
            "board_and_advisor_roles": "Board seats or advisor roles. None found if absent.",
            "education": "Highest degree + institution. Unknown if not publicly findable.",
            "linkedin_url": "Confirmed LinkedIn URL. Not found if absent.",
            "media_and_press": "Press coverage (publication + year). None found if absent.",
            "reputation_signals": "Talks, writing, awards. None found if absent.",
            "controversies_or_red_flags": "Controversies, disputed failures, negative press. None found if absent.",
            "legal_or_regulatory_issues": "Court records, enforcement actions. None found if absent.",
            "background_verdict": "One of: clean | notable_concerns | significant_red_flags",
            "background_summary": "3-5 sentences on findings and verdict basis.",
            "data_sources_note": "Sources used and any data gaps.",
        },
        "tier": "low",
    }

    response = requests.post(
        "https://api.sixtyfour.ai/people-intelligence",
        headers={"x-api-key": SIXTYFOUR_API_KEY, "Content-Type": "application/json"},
        json=payload,
        timeout=120,
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    result = run_founder_background_check(
        full_name="Saarth Shah",
        company="Sixtyfour",
        linkedin_url="https://linkedin.com/in/saarthshah",
    )
    data = result["structured_data"]
    print(f"{data['full_name']} ({data['current_role']}) — {data['background_verdict']}")
    print(data["background_summary"])
`;

export const CURL = `\
curl -X POST "https://api.sixtyfour.ai/people-intelligence" \\
  -H "x-api-key: $SIXTYFOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lead_info": {
      "full_name": "Saarth Shah",
      "company": "Sixtyfour",
      "linkedin_url": "https://linkedin.com/in/saarthshah"
    },
    "struct": {
      "full_name": "Confirmed full legal name",
      "current_role": "Current title and company.",
      "prior_companies_founded": "Companies founded. Format: Company (Year-Year, Outcome).",
      "funding_history": "Rounds raised. Format: Company - Stage $Amount (Year, Lead). None found if none.",
      "exit_history": "Acquisitions, IPOs, shutdowns. None found if absent.",
      "controversies_or_red_flags": "Controversies or negative press. None found if absent.",
      "legal_or_regulatory_issues": "Court records, enforcement. None found if absent.",
      "background_verdict": "One of: clean | notable_concerns | significant_red_flags",
      "background_summary": "3-5 sentences on findings and verdict basis.",
      "data_sources_note": "Sources used and any data gaps."
    },
    "tier": "low"
  }'
`;
