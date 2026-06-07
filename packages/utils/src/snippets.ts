/**
 * Snippet formatting helpers.
 *
 * The site's code-tabs UI shows JS/Python/cURL snippets for each demo. The
 * canonical source is hand-written TypeScript per demo (in its `snippets.ts`),
 * but a few utilities here keep the formatting consistent — JSON pretty-print,
 * env var name derivation from a slug, and an LLM-prompt template.
 */

/**
 * Convert a slug like "icp-qualifier" to "ICP_QUALIFIER_WORKFLOW_ID".
 * Used to derive env var names from demo slugs at compile time.
 */
export function slugToEnvVar(slug: string): string {
  return `${slug.toUpperCase().replace(/-/g, "_")}_WORKFLOW_ID`;
}

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
}

/**
 * Build the "Copy prompt to build this" payload that the demo page surfaces
 * via the `CopyForLLMButton`. The template is deliberately narrative — when
 * pasted into Claude/Cursor/etc. it should produce a working starter.
 */
export function buildCopyForLlmPrompt(input: CopyForLlmTemplateInput): string {
  return [
    `I want to build a "${input.demoTitle}" using the Sixtyfour API.`,
    "",
    "Here is a working JavaScript snippet that calls the Sixtyfour Workflow",
    "API end-to-end (kick off run, poll until done, download results CSV).",
    "Use it as a reference and adapt to my codebase.",
    "",
    "```javascript",
    input.jsSnippet.trim(),
    "```",
    "",
    "Requirements:",
    "- Read SIXTYFOUR_API_KEY from environment, never hardcode it.",
    `- The workflow_id env var is named ${slugToEnvVar(input.demoSlug)}.`,
    "- Use native fetch (no axios). Polling should use gentle backoff.",
    "- Throw on non-2xx responses with the response body in the error message.",
    "- Parse the CSV returned by the download URL into structured JSON.",
    "",
    "Then explain in plain English how to extend it (e.g. swap the input,",
    "add filtering, persist results to a database).",
  ].join("\n");
}
