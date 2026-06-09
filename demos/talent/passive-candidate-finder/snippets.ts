/**
 * Passive Candidate Finder — code snippets for JS, Python, and cURL.
 *
 * These are the canonical implementations. The site's code-tabs UI renders
 * these directly; the README inlines them as markdown.
 *
 * Pattern: POST /people-intelligence with a recruiting-focused struct.
 * The API returns structured_data populated with the fields you define.
 */

export const JAVASCRIPT = `\
const SIXTYFOUR_API_KEY = process.env.SIXTYFOUR_API_KEY;

async function enrichCandidate({ fullName, company, linkedinUrl }) {
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
        current_title: "Current job title",
        current_company: "Current employer",
        seniority_level: "One of: IC, Senior IC, Staff, Principal, Manager, Director, VP, C-level",
        years_experience: "Total years of professional experience (integer)",
        key_skills: "5-8 technical or functional skills, comma-separated",
        tech_stack: "Technologies they've worked with based on recent roles",
        career_summary: "2-3 sentence career narrative for a recruiter",
        notable_achievements: "2-4 bullet strings of standout achievements or projects",
        education: "Highest degree + institution",
        linkedin_url: "Confirmed LinkedIn profile URL",
        email: "Professional email address",
        open_to_work_signals: "Any public signals of job-seeking activity",
        recruiter_note: "One sentence: what makes this person worth reaching out to",
        last_company_tenure: "How long they've been at current company (e.g. '2 years 3 months')",
      },
      tier: "low",
    }),
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  const data = await response.json();
  return data.structured_data;
}

// Example usage
const profile = await enrichCandidate({
  fullName: "Sarah Chen",
  company: "Vercel",
  linkedinUrl: "https://linkedin.com/in/sarah-chen",
});

console.log(\`\${profile.current_title} at \${profile.current_company}\`);
console.log(\`Skills: \${profile.key_skills}\`);
console.log(\`Open to work: \${profile.open_to_work_signals}\`);
`;

export const PYTHON = `\
import os
import requests

SIXTYFOUR_API_KEY = os.environ["SIXTYFOUR_API_KEY"]

def enrich_candidate(full_name: str, company: str, linkedin_url: str = None) -> dict:
    payload = {
        "lead_info": {
            "full_name": full_name,
            "company": company,
            **({"linkedin_url": linkedin_url} if linkedin_url else {}),
        },
        "struct": {
            "current_title": "Current job title",
            "current_company": "Current employer",
            "seniority_level": "One of: IC, Senior IC, Staff, Principal, Manager, Director, VP, C-level",
            "years_experience": "Total years of professional experience (integer)",
            "key_skills": "5-8 technical or functional skills, comma-separated",
            "tech_stack": "Technologies they've worked with based on recent roles",
            "career_summary": "2-3 sentence career narrative for a recruiter",
            "notable_achievements": "2-4 bullet strings of standout achievements or projects",
            "education": "Highest degree + institution",
            "linkedin_url": "Confirmed LinkedIn profile URL",
            "email": "Professional email address",
            "open_to_work_signals": "Any public signals of job-seeking activity",
            "recruiter_note": "One sentence: what makes this person worth reaching out to",
            "last_company_tenure": "How long they've been at current company (e.g. '2 years 3 months')",
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
    return response.json()["structured_data"]


if __name__ == "__main__":
    profile = enrich_candidate(
        full_name="Sarah Chen",
        company="Vercel",
        linkedin_url="https://linkedin.com/in/sarah-chen",
    )
    print(f"{profile['current_title']} at {profile['current_company']}")
    print(f"Skills: {profile['key_skills']}")
    print(f"Open to work: {profile['open_to_work_signals']}")
`;

export const CURL = `\
curl -X POST "https://api.sixtyfour.ai/people-intelligence" \\
  -H "x-api-key: $SIXTYFOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lead_info": {
      "full_name": "Sarah Chen",
      "company": "Vercel",
      "linkedin_url": "https://linkedin.com/in/sarah-chen"
    },
    "struct": {
      "current_title": "Current job title",
      "current_company": "Current employer",
      "seniority_level": "One of: IC, Senior IC, Staff, Principal, Manager, Director, VP, C-level",
      "years_experience": "Total years of professional experience (integer)",
      "key_skills": "5-8 technical or functional skills, comma-separated",
      "tech_stack": "Technologies they worked with based on recent roles",
      "career_summary": "2-3 sentence career narrative for a recruiter",
      "notable_achievements": "2-4 standout achievements or projects",
      "education": "Highest degree + institution",
      "linkedin_url": "Confirmed LinkedIn profile URL",
      "email": "Professional email address",
      "open_to_work_signals": "Any public signals of job-seeking activity",
      "recruiter_note": "One sentence: what makes this person worth reaching out to",
      "last_company_tenure": "How long at current company (e.g. '2 years 3 months')"
    },
    "tier": "low"
  }'
`;
