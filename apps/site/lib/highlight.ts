/**
 * Server-only syntax highlighting via Shiki.
 *
 * Call `highlightSnippets` once per page render (server component).
 * Returns pre-rendered HTML strings — no client JS needed.
 *
 * NEVER import this from a Client Component.
 */

import { codeToHtml } from "shiki";

const THEME = "github-dark";

export interface HighlightedSnippets {
  javascript: string;
  python: string;
  curl: string;
}

export async function highlightSnippets(snippets: {
  javascript: string;
  python: string;
  curl: string;
}): Promise<HighlightedSnippets> {
  const [javascript, python, curl] = await Promise.all([
    codeToHtml(snippets.javascript, { lang: "javascript", theme: THEME }),
    codeToHtml(snippets.python, { lang: "python", theme: THEME }),
    codeToHtml(snippets.curl, { lang: "bash", theme: THEME }),
  ]);
  return { javascript, python, curl };
}

/** Highlight an arbitrary JSON value server-side. */
export async function highlightJson(value: unknown): Promise<string> {
  return codeToHtml(JSON.stringify(value, null, 2), { lang: "json", theme: THEME });
}

/** Highlight a bash/shell command string server-side. */
export async function highlightBash(code: string): Promise<string> {
  return codeToHtml(code, { lang: "bash", theme: THEME });
}
