/**
 * Per-demo snippet loader.
 *
 * Each demo has a `snippets.ts` next to its standalone script that exports
 * the canonical TypeScript and the Python/cURL translations. This module
 * re-exports them keyed by slug so the demo page can render the code-tabs
 * UI from a single source.
 */

import * as icpSnippets from "../../../demos/sales-gtm/icp-qualifier/snippets";
import * as talentSnippets from "../../../demos/talent/passive-candidate-finder/snippets";
import * as kybSnippets from "../../../demos/compliance/kyb-report/snippets";
import * as threatActorSnippets from "../../../demos/security/threat-actor-footprint/snippets";
import * as competitiveOrgSnippets from "../../../demos/entity-intel/competitive-org-intel/snippets";
import * as founderSnippets from "../../../demos/entity-intel/founder-background-check/snippets";

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
  "passive-candidate-finder": {
    javascript: talentSnippets.JAVASCRIPT,
    python: talentSnippets.PYTHON,
    curl: talentSnippets.CURL,
  },
  "kyb-report": {
    javascript: kybSnippets.JAVASCRIPT,
    python: kybSnippets.PYTHON,
    curl: kybSnippets.CURL,
  },
  "threat-actor-footprint": {
    javascript: threatActorSnippets.JAVASCRIPT,
    python: threatActorSnippets.PYTHON,
    curl: threatActorSnippets.CURL,
  },
  "competitive-org-intel": {
    javascript: competitiveOrgSnippets.JAVASCRIPT,
    python: competitiveOrgSnippets.PYTHON,
    curl: competitiveOrgSnippets.CURL,
  },
  "founder-background-check": {
    javascript: founderSnippets.JAVASCRIPT,
    python: founderSnippets.PYTHON,
    curl: founderSnippets.CURL,
  },
};

export function getSnippetsForSlug(slug: string): DemoSnippets | null {
  return SNIPPETS[slug] ?? null;
}
