# Sixtyfour Demos

> Open-source demos for the [Sixtyfour API](https://docs.sixtyfour.ai). Clone, run, fork, ship.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Every demo is a working end-to-end Sixtyfour Workflow you can run in under two minutes. Each one has:

- A canonical TypeScript script you actually run (`pnpm start`)
- A `workflow.json` you paste into your Sixtyfour account (`pnpm provision`)
- A README that's a launching pad — not a placeholder
- A live page on [demos.sixtyfour.ai](https://demos.sixtyfour.ai) that runs against your own workflow IDs

## Demos

| Category | Demo | Status |
|---|---|---|
| Sales / GTM | [ICP Qualifier](demos/sales-gtm/icp-qualifier) — score any company against your ICP rubric | Live |
| Talent | Passive Candidate Finder | Coming soon |
| Compliance / KYB | KYB Report | Coming soon |
| Security | Threat Actor Footprint | Coming soon |
| Entity / Financial Intel | Founder Background Check | Coming soon |
| Entity / Financial Intel | Competitive Org Intel | Coming soon |

## Quick start

```bash
git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos

cp .env.example .env
# paste your SIXTYFOUR_API_KEY — get one at https://app.sixtyfour.ai/keys

pnpm install
pnpm provision    # creates every demo's workflow in your Sixtyfour account
# paste the printed *_WORKFLOW_ID lines into .env

pnpm dev          # opens the demo hub at http://localhost:3000
```

Or run a single demo standalone, without spinning up the site:

```bash
cd demos/sales-gtm/icp-qualifier
cp .env.example .env
pnpm install
pnpm provision    # one-time, idempotent
pnpm start
```

Every demo follows that same 4-line setup.

## Repo layout

```
sixtyfour-demos/
├── apps/
│   └── site/                    # Next.js 14 demo hub → demos.sixtyfour.ai
├── demos/
│   ├── sales-gtm/icp-qualifier/
│   ├── talent/passive-candidate-finder/      (planned)
│   ├── compliance/kyb-report/                (planned)
│   ├── security/threat-actor-footprint/      (planned)
│   ├── entity-intel/founder-background-check/ (planned)
│   └── entity-intel/competitive-org-intel/   (planned)
├── packages/
│   ├── api-client/              # Tiny fetch wrapper around api.sixtyfour.ai
│   ├── ui/                      # Shared shadcn-style React primitives
│   └── utils/                   # Workflow poller, snippet helpers
└── scripts/
    └── provision-workflows.ts   # One-shot: creates every demo's workflow
```

Each demo is a standalone workspace, but all of them share the same `@sixtyfour-demos/api-client` so adding a 7th demo means adding one folder under `demos/<category>/<slug>/` and one entry in `apps/site/lib/demos.ts`.

## How a demo is wired up

Each demo is composed as a **Sixtyfour Workflow** (block graph) and shipped as four files:

```
demos/<category>/<slug>/
├── workflow.json        # POST body for /workflows/create_workflow
├── main.ts              # Standalone script: reads workflow_id from .env, runs it
├── README.md            # 2-min setup + extend ideas (the "launching pad")
├── snippets.ts          # JS / Python / cURL canonical snippets
├── sample-output.json   # Cached result rendered on the demo page
└── .env.example         # SIXTYFOUR_API_KEY + <SLUG>_WORKFLOW_ID
```

The site at `apps/site` reads `lib/demos.ts` (the registry) and renders one card per demo. Each demo page renders `sample-output.json` instantly and then runs a real workflow on click — the API key never reaches the browser, every Sixtyfour call goes through `/api/demo/[slug]/{run,status}`.

## Workflow provisioning

`pnpm provision` walks every `demos/*/*/workflow.json` and POSTs to `/workflows/create_workflow` with a stable id (`sixtyfour-demo-<slug>`). The endpoint upserts on the same id, so re-running is safe and reflects local edits to `workflow.json`.

The script prints the env var lines you should paste into your `.env` (or your Vercel project's environment variables):

```
ICP_QUALIFIER_WORKFLOW_ID=...
PASSIVE_CANDIDATE_FINDER_WORKFLOW_ID=...
...
```

## Add a new demo

1. Pick a category folder under `demos/` (or add one).
2. Create `demos/<category>/<your-slug>/` with the six files above. The easiest path is `cp -r demos/sales-gtm/icp-qualifier demos/<category>/<your-slug>` and edit.
3. Add a `Demo` entry to `apps/site/lib/demos.ts` matching your slug. Set `status: "coming-soon"` while you build, flip to `"live"` when shipping.
4. Run `pnpm provision` to register the new workflow in your account.
5. Open a PR — the contribution guide is in [CONTRIBUTING.md](CONTRIBUTING.md).

## Environment variables

The site (and the provisioning script) need:

| Variable | Required | Where |
|---|---|---|
| `SIXTYFOUR_API_KEY` | Yes | Server-only — never expose to the browser |
| `SIXTYFOUR_API_BASE_URL` | No (default: `https://api.sixtyfour.ai`) | Server-only |
| `<SLUG>_WORKFLOW_ID` | Yes per demo | Set after `pnpm provision` |
| `NEXT_PUBLIC_SITE_URL` | No | Public; used by metadata |

See [.env.example](.env.example) for the full list.

## Deploy your own copy

The site is a stock Next.js 14 app — works on Vercel out of the box.

1. Fork this repo.
2. Create a Vercel project pointed at the fork.
3. Set the build command to `pnpm turbo run build --filter=site` and the output directory to `apps/site/.next`.
4. Add `SIXTYFOUR_API_KEY` and the `*_WORKFLOW_ID` env vars (run `pnpm provision` locally to get the IDs).
5. Add a custom domain (e.g. `demos.sixtyfour.ai`) — CNAME to `cname.vercel-dns.com`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Run `apps/site` locally on port 3000 |
| `pnpm build` | Build everything via Turborepo |
| `pnpm lint` | Lint every workspace |
| `pnpm typecheck` | Typecheck every workspace |
| `pnpm provision` | Provision every demo's workflow into your Sixtyfour account |
| `pnpm format` | Prettier-format the repo |

## Documentation

- API reference: [docs.sixtyfour.ai](https://docs.sixtyfour.ai/introduction)
- Workflow blocks: [docs.sixtyfour.ai/api-reference/workflows/workflow-blocks](https://docs.sixtyfour.ai/api-reference/workflows/workflow-blocks)
- Get an API key: [docs.sixtyfour.ai/get-api-key](https://docs.sixtyfour.ai/get-api-key)

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution flow and the per-demo template. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).
