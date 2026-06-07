/**
 * provision-workflows.ts — Provision every demo's workflow into the caller's
 * Sixtyfour account.
 *
 * Behavior:
 *   1. Walks `demos/<category>/<slug>/workflow.json`
 *   2. POSTs each one to /workflows/create_workflow with a stable `id`
 *      (`sixtyfour-demo-<slug>`). The endpoint upserts on the same id, so
 *      this script is safe to re-run.
 *   3. Prints the env vars to paste into your `.env` (or Vercel project
 *      settings).
 *
 * Usage:
 *   export SIXTYFOUR_API_KEY=...
 *   pnpm provision
 *
 * For a clean OSS user experience: a clone-and-run user runs this once,
 * gets workflow IDs in their own account, and everything else just works.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";
import {
  SixtyfourApiError,
  SixtyfourClient,
  type WorkflowDefinition,
} from "@sixtyfour-demos/api-client";
import { slugToEnvVar } from "@sixtyfour-demos/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const DEMOS_DIR = join(REPO_ROOT, "demos");

interface DemoWorkflow {
  slug: string;
  category: string;
  workflowName: string;
  workflowDescription: string;
  workflowDefinition: WorkflowDefinition;
  filePath: string;
}

async function main() {
  const apiKey = process.env.SIXTYFOUR_API_KEY;
  if (!apiKey) {
    console.error(
      "✗ SIXTYFOUR_API_KEY is not set.\n" +
        "  Get a key at https://app.sixtyfour.ai/keys then run:\n" +
        "    export SIXTYFOUR_API_KEY=your_key_here\n" +
        "    pnpm provision",
    );
    process.exit(1);
  }

  const workflows = await loadWorkflows();
  if (workflows.length === 0) {
    console.error(
      `✗ No demo workflow.json files found under ${relative(REPO_ROOT, DEMOS_DIR)}/.`,
    );
    process.exit(1);
  }

  const client = new SixtyfourClient({
    apiKey,
    baseUrl: process.env.SIXTYFOUR_API_BASE_URL,
  });

  console.log(
    `\n→ Provisioning ${workflows.length} demo workflow${workflows.length === 1 ? "" : "s"}…\n`,
  );

  const results: { envVar: string; workflowId: string; slug: string }[] = [];
  let failed = 0;

  for (const wf of workflows) {
    const id = `sixtyfour-demo-${wf.slug}`;
    process.stdout.write(`  ${wf.slug.padEnd(28)}`);
    try {
      const created = await client.createWorkflow({
        id,
        workflow_name: wf.workflowName,
        workflow_description: wf.workflowDescription,
        workflow_definition: wf.workflowDefinition,
      });
      results.push({
        slug: wf.slug,
        envVar: slugToEnvVar(wf.slug),
        workflowId: created.id,
      });
      console.log(`✓ ${created.id}`);
    } catch (err) {
      failed += 1;
      const msg = err instanceof SixtyfourApiError ? err.message : String(err);
      console.log(`✗ ${msg}`);
    }
  }

  if (results.length === 0) {
    console.error("\n✗ All provisioning calls failed. See errors above.");
    process.exit(1);
  }

  console.log("\n→ Paste the following into your .env (or Vercel env vars):\n");
  for (const r of results) {
    console.log(`${r.envVar}=${r.workflowId}`);
  }
  console.log("");

  if (failed > 0) {
    console.error(`✗ ${failed} workflow(s) failed to provision. See errors above.`);
    process.exit(1);
  }
}

async function loadWorkflows(): Promise<DemoWorkflow[]> {
  const out: DemoWorkflow[] = [];
  const categoryEntries = await safeReaddir(DEMOS_DIR);
  for (const cat of categoryEntries) {
    const catPath = join(DEMOS_DIR, cat);
    const catStat = await safeStat(catPath);
    if (!catStat?.isDirectory()) continue;
    const demoEntries = await safeReaddir(catPath);
    for (const slug of demoEntries) {
      const demoDir = join(catPath, slug);
      const demoStat = await safeStat(demoDir);
      if (!demoStat?.isDirectory()) continue;
      const workflowPath = join(demoDir, "workflow.json");
      const wfStat = await safeStat(workflowPath);
      if (!wfStat?.isFile()) continue;
      const text = await readFile(workflowPath, "utf8");
      let parsed: {
        workflow_name?: string;
        workflow_description?: string;
        workflow_definition?: WorkflowDefinition;
      };
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error(`✗ Invalid JSON in ${relative(REPO_ROOT, workflowPath)}: ${err}`);
        continue;
      }
      if (!parsed.workflow_definition) {
        console.error(
          `✗ Missing workflow_definition in ${relative(REPO_ROOT, workflowPath)}`,
        );
        continue;
      }
      out.push({
        slug,
        category: cat,
        workflowName: parsed.workflow_name ?? `Sixtyfour Demo: ${slug}`,
        workflowDescription:
          parsed.workflow_description ?? `Generated for the ${slug} demo.`,
        workflowDefinition: parsed.workflow_definition,
        filePath: workflowPath,
      });
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

async function safeReaddir(p: string): Promise<string[]> {
  try {
    return await readdir(p);
  } catch {
    return [];
  }
}

async function safeStat(p: string) {
  try {
    return await stat(p);
  } catch {
    return null;
  }
}

main().catch((err) => {
  console.error("\n✗ Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
