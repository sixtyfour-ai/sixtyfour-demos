/**
 * Per-demo snippet loader.
 *
 * Each demo has a `snippets.ts` next to its standalone script that exports
 * the canonical TypeScript and the Python/cURL translations. This module
 * re-exports them keyed by slug so the demo page can render the code-tabs
 * UI from a single source.
 */

import * as icpSnippets from "../../../demos/sales-gtm/icp-qualifier/snippets";

export interface DemoSnippets {
  javascript: string;
  python: string;
  curl: string;
}

export const SNIPPETS: Record<string, DemoSnippets> = {
  "icp-qualifier": {
    javascript: icpSnippets.JAVASCRIPT,
    python: icpSnippets.PYTHON,
    curl: icpSnippets.CURL,
  },
};

export function getSnippetsForSlug(slug: string): DemoSnippets | null {
  return SNIPPETS[slug] ?? null;
}
