/**
 * Snippet formatting helpers.
 *
 * The site's code-tabs UI shows JS/Python/cURL snippets for each demo. The
 * canonical source is hand-written TypeScript per demo (in its `snippets.ts`),
 * but a few utilities here keep the formatting consistent — JSON pretty-print
 * and an LLM-prompt template.
 */

/**
 * Stable JSON.stringify with 2-space indent — the formatting we want in
 * snippet code blocks and copy-pasted README examples.
 */
export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export interface CopyForLlmTemplateInput {
  demoTitle: string;
  demoSlug: string;
  jsSnippet: string;
  /** One-sentence description of what the demo does. */
  oneLiner?: string;
  /** Description of what the response data contains. */
  outputBrief?: string;
}

/** Per-demo batch flagging — must match fields in each demo's struct. */
const BATCH_FLAGGING_BY_SLUG: Record<string, string> = {
  "icp-qualifier":
    "Flag rows where `icp_verdict` is `weak` or `unfit`, or `icp_fit_score` < 50, in a `flagged` column.",
  "passive-candidate-finder":
    "Optionally add a `flagged` column when `open_to_work_signals` is not `none found`.",
  "kyb-report":
    "Flag rows where `risk_verdict` is `high` or `critical` in a `flagged` column.",
  "threat-actor-footprint":
    "Flag rows where `risk_verdict` is `medium` or above in a `flagged` column.",
  "founder-background-check":
    "Flag rows where `background_verdict` is `notable_concerns` or `significant_red_flags` in a `flagged` column.",
  "competitive-org-intel":
    "Optionally add a `flagged` column when `headcount_trend` is `shrinking` or `layoffs_or_reductions` is not `None found`.",
};

/**
 * Build the "Copy agent prompt" payload that the demo page surfaces
 * via the `CopyForLLMButton`. The template is deliberately narrative — when
 * pasted into Claude/Cursor/etc. it should produce a working one-shot demo.
 */
export function buildCopyForLlmPrompt(input: CopyForLlmTemplateInput): string {
  const lines: string[] = [];

  lines.push(`Build a "${input.demoTitle}" tool using the Sixtyfour API.`);
  lines.push("");

  if (input.oneLiner) {
    lines.push(`## What it does`);
    lines.push("");
    lines.push(input.oneLiner);
    lines.push("");
  }

  if (input.outputBrief) {
    lines.push(`## What the API returns`);
    lines.push("");
    lines.push(input.outputBrief);
    lines.push("");
  }

  lines.push("## Working implementation");
  lines.push("");
  lines.push(
    "Here is a complete, working JavaScript snippet. Use it as the reference implementation.",
  );
  lines.push("");
  lines.push("```javascript");
  lines.push(input.jsSnippet.trim());
  lines.push("```");
  lines.push("");

  lines.push("## API details");
  lines.push("");
  lines.push("- **Base URL**: `https://api.sixtyfour.ai`");
  lines.push(
    "- **Auth**: Pass your API key as the `x-api-key` header. Get a key at https://app.sixtyfour.ai/keys",
  );
  lines.push(
    "- **`struct` field**: Defines your output schema. Every key becomes a field in `structured_data`; the value is a plain-English description that guides the AI agent.",
  );
  lines.push(
    "- **`tier`**: `\"low\"` = fast single-pass (10–60s). `\"medium\"` = deeper multi-source research (30s–3min). `\"high\"` = exhaustive OSINT (enterprise only).",
  );
  lines.push(
    "- **Response**: `{ structured_data, confidence_score, references, notes }`. `structured_data` contains your struct fields filled in.",
  );
  lines.push("");

  lines.push("## Requirements");
  lines.push("");
  lines.push("- Read `SIXTYFOUR_API_KEY` from the environment — never hardcode it.");
  lines.push("- Use native `fetch` — no axios or other HTTP libraries.");
  lines.push(
    "- Throw on non-2xx responses with the status code and response body in the error message.",
  );
  lines.push(
    "- Destructure `{ structured_data, confidence_score, references }` from the JSON response.",
  );
  lines.push("");

  lines.push("## Extend this");
  lines.push("");
  lines.push(
    "Once the single-item version works, extend it to handle a batch:",
  );
  lines.push(
    "1. Accept a CSV of inputs (e.g. domain, full_name + company) and parse it with a CSV library.",
  );
  lines.push(
    "2. Run enrichments concurrently — use `p-limit` or a simple semaphore to cap parallelism at 5.",
  );
  lines.push(
    "3. Write the results to a new CSV, one row per input, with all `structured_data` fields as columns.",
  );
  lines.push(
    `4. ${BATCH_FLAGGING_BY_SLUG[input.demoSlug] ?? "Optionally add a `flagged` column using the most actionable fields from this demo's `structured_data`."}`,
  );
  lines.push(
    "5. Log failed rows with their error message and continue — don't let one bad input crash the batch.",
  );

  return lines.join("\n");
}
