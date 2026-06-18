/**
 * Threat Actor Footprint — code snippets for JS, Python, and cURL.
 *
 * Pattern: POST /people-intelligence with an OSINT-oriented struct.
 * Pass a name and any available identifiers; get back a mapped footprint
 * with dark web mentions, credential leaks, threat actor signals, and a
 * risk verdict in one call.
 */

export const JAVASCRIPT = `\
const SIXTYFOUR_API_KEY = process.env.SIXTYFOUR_API_KEY;

async function mapThreatActorFootprint({ fullName, email, linkedinUrl }) {
  const response = await fetch("https://api.sixtyfour.ai/people-intelligence", {
    method: "POST",
    headers: {
      "x-api-key": SIXTYFOUR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lead_info: {
        full_name: fullName,
        ...(email && { email }),
        ...(linkedinUrl && { linkedin_url: linkedinUrl }),
      },
      struct: {
        full_name: "Confirmed full legal name",
        known_aliases:
          "Other names, handles, or usernames. 'None found' if absent.",
        confirmed_emails: "Known email addresses, comma-separated. 'None found' if absent.",
        confirmed_phone_numbers: "Known phone numbers, comma-separated. 'None found' if absent.",
        social_profiles:
          "Confirmed profiles (LinkedIn, Twitter/X, GitHub, etc.). Format: 'Platform: URL'. 'None found' if absent.",
        professional_background:
          "Current and recent employers, roles, and tenure — one line each.",
        technical_skills:
          "Programming languages, security tools, or technical domains. 'None found' if unidentifiable.",
        forum_and_community_presence:
          "Activity on HN, Reddit, Stack Overflow, security forums, etc. 'None found' if absent.",
        dark_web_mentions:
          "Mentions on dark web forums, paste sites, or underground markets. 'None found' if absent.",
        credential_leak_exposure:
          "Appearances in known data breaches. Cite source/date if known. 'None found' if absent.",
        domain_and_infrastructure:
          "Domains or IPs registered to or associated with this person. 'None found' if absent.",
        threat_actor_signals:
          "Associations with threat groups, CVE authorship, or public attribution. 'None found' if absent.",
        legal_and_public_record:
          "Court records, regulatory actions, law enforcement mentions. 'None found' if absent.",
        risk_score:
          "Integer 0-100. 0 = no signals, 100 = confirmed high-risk actor.",
        risk_verdict: "One of: none | low | medium | high | critical",
        risk_summary: "3-5 sentences on key findings and basis for verdict.",
        data_sources_note: "OSINT databases, breach indices, social platforms used. Note any gaps.",
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
const { structured_data } = await mapThreatActorFootprint({
  fullName: "Saarth Shah",
  email: "saarth@sixtyfour.ai",
  linkedinUrl: "https://linkedin.com/in/saarthshah",
});
console.log(\`\${structured_data.full_name} — risk: \${structured_data.risk_verdict} (\${structured_data.risk_score}/100)\`);
console.log(structured_data.risk_summary);
`;

export const PYTHON = `\
import os
import requests

SIXTYFOUR_API_KEY = os.environ["SIXTYFOUR_API_KEY"]


def map_threat_actor_footprint(
    full_name: str,
    email: str = None,
    linkedin_url: str = None,
) -> dict:
    lead_info = {"full_name": full_name}
    if email:
        lead_info["email"] = email
    if linkedin_url:
        lead_info["linkedin_url"] = linkedin_url

    payload = {
        "lead_info": lead_info,
        "struct": {
            "full_name": "Confirmed full legal name",
            "known_aliases": "Other names or handles. 'None found' if absent.",
            "confirmed_emails": "Known emails, comma-separated. 'None found' if absent.",
            "confirmed_phone_numbers": "Known phones, comma-separated. 'None found' if absent.",
            "social_profiles": "Confirmed profiles. Format: 'Platform: URL'. 'None found' if absent.",
            "professional_background": "Employers, roles, and tenure. One line each.",
            "technical_skills": "Languages, tools, technical domains. 'None found' if absent.",
            "forum_and_community_presence": "HN, Reddit, Stack Overflow, security forums. 'None found' if absent.",
            "dark_web_mentions": "Dark web/paste site mentions. 'None found' if absent.",
            "credential_leak_exposure": "Data breach appearances with source/date. 'None found' if absent.",
            "domain_and_infrastructure": "Domains or IPs associated with this person. 'None found' if absent.",
            "threat_actor_signals": "Threat group associations, CVEs, public attribution. 'None found' if absent.",
            "legal_and_public_record": "Court records, regulatory actions, press. 'None found' if absent.",
            "risk_score": "Integer 0-100.",
            "risk_verdict": "One of: none | low | medium | high | critical",
            "risk_summary": "3-5 sentences on findings and verdict basis.",
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
    result = map_threat_actor_footprint(
        full_name="Saarth Shah",
        email="saarth@sixtyfour.ai",
        linkedin_url="https://linkedin.com/in/saarthshah",
    )
    data = result["structured_data"]
    print(f"{data['full_name']} — risk: {data['risk_verdict']} ({data['risk_score']}/100)")
    print(data["risk_summary"])
`;

export const CURL = `\
curl -X POST "https://api.sixtyfour.ai/people-intelligence" \\
  -H "x-api-key: $SIXTYFOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lead_info": {
      "full_name": "Saarth Shah",
      "email": "saarth@sixtyfour.ai",
      "linkedin_url": "https://linkedin.com/in/saarthshah"
    },
    "struct": {
      "full_name": "Confirmed full legal name",
      "known_aliases": "Other names or handles. None found if absent.",
      "social_profiles": "Confirmed profiles. Format: Platform: URL.",
      "dark_web_mentions": "Dark web or paste site mentions. None found if absent.",
      "credential_leak_exposure": "Data breach appearances. Cite source/date if known. None found if absent.",
      "threat_actor_signals": "Threat group associations, CVEs, attribution. None found if absent.",
      "risk_score": "Integer 0-100.",
      "risk_verdict": "One of: none | low | medium | high | critical",
      "risk_summary": "3-5 sentences on findings and verdict basis.",
      "data_sources_note": "Sources used and any data gaps."
    },
    "tier": "low"
  }'
`;
