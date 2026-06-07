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

export interface AsyncJobResponse {
  task_id: string;
  status?: string;
}

export interface JobStatusResponse {
  task_id: string;
  status: "queued" | "running" | "completed" | "failed" | string;
  result?: CompanyIntelligenceResponse;
  error?: string;
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export type WorkflowStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface WorkflowBlock {
  id: string;
  block_name: string;
  specs?: Record<string, unknown>;
}

export interface WorkflowEdge {
  from_block_id: string;
  to_block_id: string;
  condition?: string | null;
}

export interface WorkflowDefinition {
  blocks: WorkflowBlock[];
  edges: WorkflowEdge[];
}

export interface CreateWorkflowRequest {
  workflow_name: string;
  workflow_description?: string;
  workflow_definition: WorkflowDefinition;
  /** Optional stable identifier — passing the same id twice is an upsert. */
  id?: string;
}

export interface CreateWorkflowResponse {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  step?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RunWorkflowRequest {
  /** Override values for the first block's specs (used for dynamic inputs). */
  specs_override?: Record<string, unknown>;
  /** Webhook payload (single object or array). */
  webhook_payload?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export interface RunWorkflowResponse {
  status: string;
  workflow_id: string;
  job_id: string;
  cache_config?: unknown;
}

export interface BlockLiveStatus {
  block_name: string;
  sequence_number: number;
  status: WorkflowStatus | string;
  processed_count: number;
  total_count: number;
  estimated_total_count?: number | null;
  last_updated?: string;
  error_message?: string | null;
  metrics?: Record<string, unknown>;
}

export interface LiveStatusResponse {
  run_id: string;
  workflow_id: string;
  overall_status: WorkflowStatus | string;
  current_block?: string;
  current_block_sequence?: number;
  total_blocks?: number;
  completed_blocks?: number;
  started_at?: string;
  completed_at?: string | null;
  last_updated?: string;
  overall_progress_percentage: number;
  estimation_blocked_by?: string | null;
  blocks?: BlockLiveStatus[];
}

export interface DownloadLink {
  filename: string;
  storage_bucket?: string;
  row_count: number;
  block_number: number;
  created_at?: string;
  message?: string | null;
  download_url: string;
  download_expires_in_seconds: number;
}

export type DownloadLinksResponse = DownloadLink[];
