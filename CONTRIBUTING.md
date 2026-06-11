# Contributing to sixtyfour-demos

PRs, bug reports, and doc improvements are welcome. Please read this guide before opening one.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Report unacceptable behavior to [support@sixtyfour.ai](mailto:support@sixtyfour.ai).

## Local setup

Prerequisites: Node 20+ and pnpm 9+.

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm dev         # http://localhost:3000
```

Before opening a PR, run:

```bash
pnpm lint
pnpm typecheck
pnpm turbo build
```

CI runs the same three commands. Anything red there is red on review.

## Adding a new demo

A demo is a standalone workspace under `demos/<category>/<slug>/`. Copy `demos/sales-gtm/icp-qualifier` as your starting point.

Each demo ships these files:

| File | What it is |
|---|---|
| `main.ts` | Standalone script — reads `SIXTYFOUR_API_KEY` from `.env`, runs the enrichment, prints structured output |
| `snippets.ts` | Canonical JS / Python / cURL snippets shown on the demo page |
| `sample-output.json` | A real, recorded result that renders on first page load |
| `README.md` | The launching pad — see "README expectations" below |
| `.env.example` | `SIXTYFOUR_API_KEY` plus any demo-specific config |
| `package.json` + `tsconfig.json` | Boilerplate; copy from ICP Qualifier |

After your files are in place:

1. **Register it** — add a `Demo` entry to `apps/site/lib/demos.ts`. Use `status: "coming-soon"` while you build; flip to `"live"` when ready.
2. **Wire sample output** — static-import your `sample-output.json` in `apps/site/lib/sample-outputs.ts`.
3. **Wire snippets** — re-export your snippets keyed by slug in `apps/site/lib/snippets.ts`.
4. **Add the API dispatch** — add a branch for your slug in `apps/site/app/api/demo/[slug]/run/route.ts` that calls the appropriate Sixtyfour endpoint and streams the result via SSE.
5. **Smoke test** — `pnpm dev`, click your card, click Run, confirm the live result populates.

### README expectations

Every demo README must contain:

- **What it does** — 1 paragraph in plain English. No fluff.
- **What you get back** — a real JSON example, copy-pasted from a live run.
- **2-minute setup** — the commands that get to a working result.
- **The API call, exposed** — show the raw `fetch` calls. Devs need to see what's happening on the wire.
- **Extend this** — 3–5 concrete ideas (swap inputs, batch, add Slack, persist results, change tier, etc.).

### Recording a `sample-output.json`

Run `pnpm start` against real input once your demo is working and save the printed JSON to `sample-output.json`. The site renders this file as the cached output on first page load — a stale or fake sample makes the demo feel broken.

## PR guidelines

- Keep PRs focused. One demo per PR. Refactors and chores in their own PRs.
- Confirm `pnpm lint && pnpm typecheck && pnpm turbo build` are green locally.
- Confirm `pnpm dev` renders your demo card and the demo page works end-to-end.
- All PRs require at least one approving review before merging.
- Link related issues with `Closes #<n>`.

## Reporting bugs

Open a [GitHub Issue](../../issues) with:

- Clear title + description
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, browser if applicable)

## Suggesting features

Open a [GitHub Issue](../../issues) labeled `enhancement`. For new demo ideas, an issue first is welcome — we'll help scope before you build.

## Development tips

- Copy any `.env.example` to `.env` locally and never commit secrets.
- The site proxies all Sixtyfour API calls server-side — never call `api.sixtyfour.ai` from a Client Component.
- Demo results stream to the browser via SSE from `/api/demo/[slug]/run`.

## Questions

Open a discussion or email [support@sixtyfour.ai](mailto:support@sixtyfour.ai).
