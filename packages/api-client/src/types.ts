/**
 * Shapes for Sixtyfour API endpoints.
 *
 * Intentionally narrow — we only model the fields the demos actually consume.
 * If the API adds new fields, they pass through transparently.
 */

// ---------------------------------------------------------------------------
// Company Intelligence
// ---------------------------------------------------------------------------

export interface CompanyIntelligenceRequest {
  target_company: {
    company_name?: string;
    website?: string;
    domain?: string;
    linkedin_url?: string;
  };
  struct: Record<string, string>;
  tier?: "low" | "medium" | "high";
  find_people?: boolean;
  people_focus_prompt?: string;
  lead_struct?: Record<string, string>;
  full_org_chart?: boolean;
  research_plan?: string;
}

export interface CompanyIntelligenceResponse {
  structured_data: Record<string, unknown>;
  notes?: string;
  references?: Record<string, string>;
  confidence_score?: number;
  people?: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// People Intelligence
// ---------------------------------------------------------------------------

export interface PeopleIntelligenceRequest {
  lead_info: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    company_domain?: string;
    linkedin_url?: string;
    email?: string;
  };
  struct: Record<string, string>;
  tier?: "low" | "medium" | "high";
  research_plan?: string;
}

export interface PeopleIntelligenceResponse {
  structured_data: Record<string, unknown>;
  notes?: string;
  references?: Record<string, string>;
  confidence_score?: number;
}
