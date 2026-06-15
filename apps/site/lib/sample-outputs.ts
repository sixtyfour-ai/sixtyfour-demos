/**
 * Statically-imported sample outputs.
 *
 * The site renders these on first load so a visitor sees a populated demo
 * panel without an API call. Clicking "Run demo" fires a real run via the
 * proxy and overwrites the panel.
 *
 * Imports are static so Next.js bundles the JSON into the page payload.
 * Demos that haven't shipped yet (status === "coming-soon") simply don't
 * appear in this map.
 */

import icpSample from "../../../demos/sales-gtm/icp-qualifier/sample-output.json";
import talentSample from "../../../demos/talent/passive-candidate-finder/sample-output.json";
import kybSample from "../../../demos/compliance/kyb-report/sample-output.json";
import threatSample from "../../../demos/security/threat-actor-footprint/sample-output.json";
import founderSample from "../../../demos/entity-intel/founder-background-check/sample-output.json";
import coiSample from "../../../demos/entity-intel/competitive-org-intel/sample-output.json";

export const SAMPLE_OUTPUTS: Record<string, unknown> = {
  "icp-qualifier": icpSample,
  "passive-candidate-finder": talentSample,
  "kyb-report": kybSample,
  "threat-actor-footprint": threatSample,
  "founder-background-check": founderSample,
  "competitive-org-intel": coiSample,
};

export function getSampleOutput(slug: string): unknown {
  return SAMPLE_OUTPUTS[slug] ?? null;
}
