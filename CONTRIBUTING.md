# Contributing to sixtyfour-demos

Thank you for your interest in contributing! We welcome bug reports, feature requests, doc improvements, and (especially) new demos. Please read this guide before opening a PR.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms. Report unacceptable behavior to [support@sixtyfour.ai](mailto:support@sixtyfour.ai).

## Local setup

Prerequisites: Node 20+ and pnpm 9+.

```bash
git clone https://github.com/<your-username>/sixtyfour-demos.git
cd sixtyfour-demos

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm provision   # creates every demo's workflow in your Sixtyfour account
pnpm dev         # http://localhost:3000
```

Before opening a PR, run all three of:

```bash
pnpm lint
pnpm typecheck
pnpm turbo build
```

CI runs the same three commands. Anything that's red there is red on review.

## Adding a new demo

A demo is a standalone workspace under `demos/<category>/<slug>/`. The fastest path is to copy `demos/sales-gtm/icp-qualifier` and edit it — that's the canonical template.

Each demo ships **six files**:

| File | What it is |
|---|---|
| `workflow.json` | The Sixtyfour [Workflow Definition](https://docs.sixtyfour.ai/guides/programmatic-workflows) — the block graph that powers this demo |
| `main.ts` | The standalone script users run with `pnpm start` — uses `fetch` against `api.sixtyfour.ai` |
| `snippets.ts` | Canonical JS / Python / cURL snippets shown on the demo page |
| `sample-output.json` | A real, recorded result that renders on first page load |
| `README.md` | The launching pad — see "README expectations" below |
| `.env.example` | Per-demo env vars (`SIXTYFOUR_API_KEY` + `<SLUG>_WORKFLOW_ID` + any demo-specific config) |
| `package.json` + `tsconfig.json` | Boilerplate; copy from the ICP Qualifier |

After your six files are in place:

1. **Wire it into the site registry** — add a `Demo` entry to `apps/site/lib/demos.ts`. Use `status: "coming-soon"` while you build; flip to `"live"` when ready.
2. **Wire it into `apps/site/lib/sample-outputs.ts`** — static-import your `sample-output.json` so the demo page renders the cached version instantly.
3. **Wire it into `apps/site/lib/snippets.ts`** — re-export your snippets keyed by slug.
4. **Provision** — `pnpm provision` will pick up your new `workflow.json` automatically.
5. **Smoke test** — `pnpm dev`, click your card, click Run, confirm the live result populates.

### README expectations (the "launching pad")

The single most important deliverable in any demo is the README. The whole point of this repo is **devs cloning a demo and shipping their own version fast** — a placeholder README defeats that.

Every demo README must contain:

- **What it does** — 1 paragraph in plain English. No fluff.
- **What you get back** — a real JSON example, copy-pasted from a live run.
- **2-minute setup** — the four-line clone-and-run that gets to a working result.
- **The API call, exposed** — show the raw `fetch` calls, not just the wrapper. Devs need to see what's actually happening on the wire.
- **How the workflow is composed** — annotate `workflow.json`. Which block does what. Where to swap a value.
- **Extend this** — 3–5 concrete ideas (swap inputs, batch, add Slack, persist, change tier, etc.).
- **Copy-for-LLM prompt** — same prompt as the site button, inlined as a markdown code block so devs reading on GitHub can grab it.

The ICP Qualifier README is the bar — match or beat it.

### Recording a `sample-output.json`

Run `pnpm start` against a real domain once your `workflow.json` is provisioned, and save the printed JSON to `sample-output.json`. The site renders that file as the cached output on first page load — a stale or fake sample makes the demo feel broken.

If the demo's output shape changes (different `output_schema` in `transform_data`, etc.), re-record.

## PR guidelines

- Keep PRs focused. One demo per PR. Refactors and chores in their own PRs.
- Fill out the pull request template completely.
- Confirm `pnpm lint && pnpm typecheck && pnpm turbo build` are green locally.
- Confirm `pnpm dev` renders your demo card on the landing page and the demo page itself works end-to-end.
- All PRs require **at least one approving review** before merging. Head branches are deleted on merge.
- Link related issues with `Closes #<n>`.

## Reporting bugs

Open a [GitHub Issue](../../issues) with:

- Clear title + description
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, runtime, browser)

## Suggesting features

Open a [GitHub Issue](../../issues) labeled `enhancement` describing:

- The problem you're solving
- Your proposed solution
- Any alternatives you considered

For brand-new demo ideas, an issue first is welcome — we'll help you scope before you build.

## Development tips

- Copy any `.env.example` to `.env` locally and never commit secrets.
- The site uses server-side proxying for the Sixtyfour API — never call `api.sixtyfour.ai` from a Client Component.
- Workflow IDs are organization-scoped. The provisioning script writes to whichever org owns the `SIXTYFOUR_API_KEY` you have set.
- Re-running `pnpm provision` is safe — every workflow has a stable `id` (`sixtyfour-demo-<slug>`) and the create endpoint upserts on it.

## Questions

Open a discussion or email [support@sixtyfour.ai](mailto:support@sixtyfour.ai).
