/**
 * Shared intelligence `struct` builders for demo scripts and the site API route.
 * Single source of truth — do not duplicate field definitions in standalone demos.
 */

/**
 * Build the people-intelligence `struct` for OSINT threat-actor footprint mapping.
 */
export function buildThreatActorStruct(): Record<string, string> {
  return {
    full_name: "Confirmed full legal name",
    known_aliases:
      "Other names, handles, or usernames attributed to this person. 'None found' if absent.",
    confirmed_emails: "Known email addresses, comma-separated. 'None found' if absent.",
    confirmed_phone_numbers: "Known phone numbers, comma-separated. 'None found' if absent.",
    social_profiles:
      "Confirmed social platform profiles (LinkedIn, Twitter/X, GitHub, Facebook, Instagram, etc.). Format: 'Platform: URL'. 'None found' if absent.",
    professional_background:
      "Current and recent employers, roles, and approximate tenure — one line each.",
    technical_skills:
      "Programming languages, security tools, platforms, or technical domains the subject is publicly associated with. 'None found' if not identifiable.",
    forum_and_community_presence:
      "Activity on technical forums, open-source communities, security communities, or niche platforms (HN, Reddit, Stack Overflow, etc.). 'None found' if absent.",
    dark_web_mentions:
      "Any mentions, handles, or references on dark web forums, paste sites, or underground markets. 'None found' if absent.",
    credential_leak_exposure:
      "Any email addresses or usernames appearing in known data breaches or credential dumps (cite source/date if known). 'None found' if absent.",
    domain_and_infrastructure:
      "Domains, IPs, or hosting infrastructure registered to or associated with this person. 'None found' if absent.",
    threat_actor_signals:
      "Indicators of malicious activity: known associations with threat groups, CVE authorship, responsible disclosure reports, or public attribution by researchers. 'None found' if absent.",
    legal_and_public_record:
      "Court records, regulatory actions, law enforcement mentions, or press reports of criminal or civil matters. 'None found' if absent.",
    risk_score:
      "Integer 0–100 reflecting overall threat / risk level. 0 = no signals, 100 = confirmed high-risk actor.",
    risk_verdict: "One of: none | low | medium | high | critical",
    risk_summary:
      "3–5 sentences summarising the key findings and the basis for the risk verdict.",
    data_sources_note:
      "Primary sources used (OSINT databases, social platforms, breach indices, public records, etc.) and any notable data gaps.",
  };
}

/**
 * Build the people-intelligence `struct` for passive candidate enrichment.
 */
export function buildTalentStruct(): Record<string, string> {
  return {
    current_title: "Current job title",
    current_company: "Current employer",
    seniority_level: "One of: IC, Senior IC, Staff, Principal, Manager, Director, VP, C-level",
    years_experience: "Total years of professional experience (integer)",
    key_skills: "5-8 technical or functional skills, comma-separated",
    tech_stack: "Technologies they've worked with based on current and recent roles",
    career_summary: "2-3 sentence career narrative written for a recruiter",
    notable_achievements: "2-4 bullet strings of standout achievements or projects",
    education: "Highest degree + institution",
    linkedin_url: "Confirmed LinkedIn profile URL",
    email: "Professional email address",
    open_to_work_signals:
      "Any public signals of job-seeking activity (posts, profile status, recent departures). 'none found' if absent.",
    recruiter_note: "One sentence: what makes this person worth reaching out to",
    last_company_tenure: "How long they've been at current company (e.g. '2 years 3 months')",
  };
}

/**
 * Build the company-intelligence `struct` for KYB due-diligence reporting.
 */
export function buildKybStruct(): Record<string, string> {
  return {
    company_name: "Official registered company name",
    registration_number: "Company registration or incorporation number (if findable)",
    jurisdiction: "Country and state/province of incorporation",
    registered_address: "Registered office address",
    operating_address: "Primary operating address if different from registered",
    company_type: "Legal entity type (LLC, C-Corp, Ltd, GmbH, etc.)",
    incorporation_date: "Date of incorporation (YYYY-MM-DD or YYYY)",
    operational_status: "Active, Dissolved, Suspended, or Unknown",
    industry: "Primary industry or vertical (1–3 words)",
    employee_count: "Estimated total employees (integer)",
    annual_revenue_estimate: "Most recent known annual revenue with source year",
    beneficial_owners:
      "Known ultimate beneficial owners (UBOs) owning >= 10%. Format: 'Name – ownership %, role'. 'None found' if not identified.",
    key_executives:
      "Current CEO, CFO, and board chair (name + title). 'Unknown' if not found.",
    parent_company: "Immediate parent entity and its jurisdiction. 'None' if independent.",
    subsidiaries: "Known subsidiaries or affiliated entities. 'None found' if none.",
    sanctions_exposure:
      "Any matches or near-matches on OFAC SDN, EU consolidated, UN, or UKOF sanctions lists. 'None found' if clean.",
    pep_exposure:
      "Any executives or owners who are Politically Exposed Persons (PEPs). 'None found' if clean.",
    shell_company_signals:
      "Indicators of a shell or pass-through entity: nominee directors, no employees, virtual office address, complex ownership layers. 'None found' if absent.",
    adverse_media_summary:
      "Recent negative news: fraud, litigation, regulatory action, money-laundering allegations. Date-stamped where possible. 'None found' if clean.",
    litigation_and_regulatory:
      "Active or recent lawsuits, fines, license revocations, or regulatory investigations. 'None found' if clean.",
    risk_score:
      "Integer 0–100 reflecting overall KYB risk. 0 = very low risk, 100 = very high risk.",
    risk_verdict:
      "One of: low | medium | high | critical — based on aggregate signals above.",
    risk_summary:
      "3–5 sentences summarising the key risk findings and the basis for the verdict.",
    data_sources_note:
      "Brief note on the primary sources used (company registries, sanctions lists, news, EDGAR, etc.) and any data gaps.",
  };
}

/**
 * Build the people-intelligence `struct` for founder background checks.
 */
export function buildFounderStruct(): Record<string, string> {
  return {
    full_name: "Confirmed full legal name",
    current_role:
      "Current title and company (e.g. 'CEO at Acme Inc.'). 'Unknown' if not determinable.",
    prior_companies_founded:
      "Companies this person founded or co-founded. Format one per line: 'Company (Year–Year or Year–present, Outcome: active/acquired/shutdown/failed)'. 'None found' if none.",
    prior_executive_roles:
      "Senior leadership positions (VP, C-suite, President, GM) held outside of founding roles. Format one per line: 'Title at Company (Year–Year)'. 'None found' if none.",
    total_capital_raised:
      "Aggregate capital raised across all this person's ventures (best estimate with source). 'Unknown' if not determinable.",
    funding_history:
      "Individual funding rounds raised across ventures. Format one per line: 'Company — Stage $Amount (Year, Lead Investor or Undisclosed)'. 'None found' if none.",
    key_investors:
      "Notable investors or funds who have backed this person's ventures, comma-separated. 'None found' if not identifiable.",
    exit_history:
      "Acquisitions, IPOs, shutdowns, or other exits of the founder's ventures. Format one per line: 'Company — Outcome (Year, Acquirer or Exchange if applicable)'. 'None found' if absent.",
    board_and_advisor_roles:
      "Board seats or formal advisor roles at other companies. Format: 'Role at Company'. 'None found' if absent.",
    education:
      "Highest degree and institution. 'Unknown' if not publicly findable.",
    linkedin_url:
      "Confirmed LinkedIn profile URL. 'Not found' if absent.",
    media_and_press:
      "Notable press coverage, profiles, or interviews (name publication + year). 'None found' if absent.",
    reputation_signals:
      "Public talks, podcast appearances, published writing, awards, or notable endorsements. 'None found' if absent.",
    controversies_or_red_flags:
      "Public controversies, notably failed ventures with disputed circumstances, public disputes, or negative press. Describe briefly with source/year. 'None found' if absent.",
    legal_or_regulatory_issues:
      "Court records, SEC filings, regulatory investigations, enforcement actions, or civil judgments. 'None found' if absent.",
    background_verdict:
      "One of: clean | notable_concerns | significant_red_flags",
    background_summary:
      "3–5 sentences summarising the key findings and the basis for the verdict.",
    data_sources_note:
      "Primary sources used (LinkedIn, Crunchbase, Pitchbook, press archives, public records, SEC EDGAR, etc.) and any notable data gaps.",
  };
}

/**
 * Build the company-intelligence `struct` for ICP scoring.
 */
export function buildIcpStruct(icpDescription: string): Record<string, string> {
  return {
    company_name: "Official company name",
    industry: "Primary industry or vertical (1–3 words)",
    headquarters: "City, state/region, country of headquarters",
    employee_count: "Estimated total employees (integer)",
    employee_count_range: "Headcount bucket (e.g. '50-200', '200-500', '500-1000', '1000+')",
    annual_revenue_estimate: "Most recent known ARR or annual revenue with source year",
    funding_stage: "Latest funding stage (Seed, Series A, B, C, D+, Public, Bootstrapped)",
    last_funding_round: "Most recent round: name, amount, lead investor",
    last_funding_date: "Date of last funding (YYYY-MM-DD or YYYY)",
    primary_buyer_persona: "Primary buyer role at the company (CTO, VP Eng, CFO, etc.)",
    tech_stack_signals: "Notable technologies in use (3–6 items)",
    key_products_or_services: "What the company sells — one sentence",
    target_market: "Who they sell to / their ICP",
    notable_signals: "Recent activity (launch, hire, layoff, fundraise) in last 90 days",
    icp_fit_score: `Integer 0–100 scoring this company against the following ICP rubric: "${icpDescription.replace(/"/g, '\\"')}". A score >= 75 is "strong", 50-74 "moderate", 25-49 "weak", < 25 "unfit".`,
    icp_verdict: "One of: strong | moderate | weak | unfit",
    icp_reasoning:
      "2–4 sentences explaining the fit score, citing specific company facts from above",
    icp_key_facts: "5–8 bullet strings of company facts most relevant to the rubric",
    icp_mismatches: "ICP criteria the company fails to meet. 'none' if perfect fit.",
  };
}
