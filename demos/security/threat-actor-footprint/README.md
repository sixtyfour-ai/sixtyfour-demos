# Threat Actor Footprint

Map a person's online footprint across social platforms, forums, dark web mentions, and credential leak databases in one Sixtyfour API call — structured, sourced, and risk-scored.

## What it does

Pass a name and any available identifiers (email, LinkedIn URL). Sixtyfour's research agent builds an OSINT-grade footprint and returns:

- Confirmed identity: full name, known aliases, email addresses, phone numbers
- Platform presence: social profiles, technical forums, open-source communities
- Exposure signals: dark web mentions, credential leak appearances, associated infrastructure
- Threat indicators: threat group associations, CVE authorship, public attribution by researchers
- Legal and public record: court records, regulatory actions, press reports
- An overall risk score (0–100) and verdict (`none | low | medium | high | critical`)
- A risk summary citing specific findings
- Source URLs the agents referenced

One POST, one response. No workflow provisioning, no polling.

## What you get back

```json
{
  "full_name": "Saarth Shah",
  "known_aliases": "saarthshah (GitHub, LinkedIn handle)",
  "confirmed_emails": "saarth@sixtyfour.ai",
  "confirmed_phone_numbers": "None found",
  "social_profiles": "LinkedIn: https://linkedin.com/in/saarthshah\nTwitter/X: @saarthshah\nGitHub: https://github.com/saarthshah",
  "professional_background": "CEO & Co-founder, Sixtyfour (2023–present)\nPrior: early-stage SaaS startups (product and engineering roles)",
  "technical_skills": "Python, TypeScript, LLMs, API architecture, product strategy, developer GTM",
  "forum_and_community_presence": "Active on LinkedIn and Twitter/X; open-source activity on GitHub; no significant presence on security forums or niche underground communities",
  "dark_web_mentions": "None found",
  "credential_leak_exposure": "None found in major breach indices",
  "domain_and_infrastructure": "sixtyfour.ai (registered operator); api.sixtyfour.ai, docs.sixtyfour.ai (subdomains)",
  "threat_actor_signals": "None found — no associations with threat groups, CVE authorship, or adverse attribution",
  "legal_and_public_record": "None found — no court records, regulatory actions, or adverse press",
  "risk_score": "3",
  "risk_verdict": "none",
  "risk_summary": "Saarth Shah is a publicly visible tech founder with a clean digital footprint. No adverse signals were identified across breach databases, dark web sources, or public records. The minimal score reflects standard founder-level public presence with no threat indicators.",
  "data_sources_note": "LinkedIn, Twitter/X, GitHub, HaveIBeenPwned index, WHOIS, press sources, Google News. Dark web scan limited to indexed sources; private forums not accessible."
}
```

## 2-minute setup

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/demos/security/threat-actor-footprint

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm start       # maps footprint for TARGET_NAME (default: Saarth Shah)
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
      email: "saarth@sixtyfour.ai",       // optional — improves accuracy
      linkedin_url: "https://linkedin.com/in/saarthshah", // optional
    },
    struct: {
      known_aliases: "Other names, handles, or usernames. 'None found' if absent.",
      social_profiles: "Confirmed profiles (LinkedIn, Twitter/X, GitHub, etc.). Format: 'Platform: URL'.",
      credential_leak_exposure: "Appearances in known data breaches. 'None found' if absent.",
      dark_web_mentions: "Mentions on dark web forums or paste sites. 'None found' if absent.",
      threat_actor_signals: "Indicators of malicious activity or threat group association. 'None found' if absent.",
      risk_score: "Integer 0–100. 0 = no signals, 100 = confirmed high-risk actor.",
      risk_verdict: "One of: none | low | medium | high | critical",
      risk_summary: "3–5 sentences summarising key findings and basis for verdict.",
    },
    tier: "low",
  }),
});
const { structured_data, confidence_score, references } = await result.json();
```

The `struct` field defines your output schema. Every key becomes a response field; the value describes what to find and how to format it.

## How it works

| Component | What it does |
|---|---|
| `lead_info.full_name` | Anchors identity — required |
| `lead_info.email` | Confirms identity; enables breach index lookups |
| `lead_info.linkedin_url` | Strongest anchor for social profile enumeration |
| `struct` (presence fields) | Instructs the agent to enumerate profiles and community activity |
| `struct` (risk fields) | Embeds the scoring criteria — breach exposure, dark web, threat attribution |
| `tier: "low"` | Fast single-pass (10–60s). Use `"medium"` for common names or exhaustive OSINT. |

## Extend this

1. **Employee security screening** — run on new hires or contractors before access is granted. Flag anything above `low` for manual review.
2. **Vendor due diligence** — screen key personnel at third-party vendors alongside KYB checks on their companies.
3. **Monitor your own footprint** — schedule weekly runs on your executive team to detect new credential leaks or adverse mentions.
4. **Combine with KYB** — run Threat Actor Footprint on a company's founders alongside a KYB Report for full entity + person coverage.
5. **Use `tier: "medium"` for common names** — broader research reduces false negatives from identity collisions.

## License

MIT — same as the rest of the monorepo.
