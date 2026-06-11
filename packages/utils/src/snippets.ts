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
}

/**
 * Build the "Copy agent prompt" payload that the demo page surfaces
 * via the `CopyForLLMButton`. The template is deliberately narrative — when
 * pasted into Claude/Cursor/etc. it should produce a working starter.
 */
export function buildCopyForLlmPrompt(input: CopyForLlmTemplateInput): string {
  return [
    `I want to build a "${input.demoTitle}" using the Sixtyfour API.`,
    "",
    "Here is a working JavaScript snippet that calls the Sixtyfour API.",
    "Use it as a reference and adapt to my codebase.",
    "",
    "```javascript",
    input.jsSnippet.trim(),
    "```",
    "",
    "Requirements:",
    "- Read SIXTYFOUR_API_KEY from environment, never hardcode it.",
    "- Use native fetch (no axios).",
    "- Throw on non-2xx responses with the response body in the error message.",
    "",
    "Then explain in plain English how to extend it (e.g. swap the input,",
    "add filtering, persist results to a database).",
  ].join("\n");
}
