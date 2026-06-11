# Sixtyfour Demos

> Open-source demos for the [Sixtyfour API](https://docs.sixtyfour.ai). Clone, run, fork, ship.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Every demo is a working end-to-end Sixtyfour API integration you can run in under two minutes. Each one has:

- A canonical TypeScript script you can run locally (`pnpm start`)
- A README that's a launching pad — not a placeholder
- A live page on [demos.sixtyfour.ai](https://demos.sixtyfour.ai) that runs against your own API key

## Demos

| Category | Demo | Status |
|---|---|---|
| Sales / GTM | [ICP Qualifier](demos/sales-gtm/icp-qualifier) — score any company against your ICP rubric | Live |
| Talent | [Passive Candidate Finder](demos/talent/passive-candidate-finder) — recruiter-ready profile from a name + company | Live |
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
pnpm dev          # opens the demo hub at http://localhost:3000
```

Or run a single demo standalone, without spinning up the site:

```bash
cd demos/sales-gtm/icp-qualifier
cp .env.example .env
# paste your SIXTYFOUR_API_KEY
pnpm install
pnpm start
```

Every demo follows the same setup.

## Repo layout

```
sixtyfour-demos/
├── apps/
│   └── site/                    # Next.js 14 demo hub → demos.sixtyfour.ai
├── demos/
│   ├── sales-gtm/icp-qualifier/
│   └── talent/passive-candidate-finder/
├── packages/
│   ├── api-client/              # Thin fetch wrapper around api.sixtyfour.ai
│   ├── ui/                      # Shared shadcn-style React primitives
│   └── utils/                   # Snippet helpers
└── scripts/                     # Reserved for future tooling
```

Each demo is a standalone workspace. Adding a new demo means one folder under `demos/<category>/<slug>/` and one entry in `apps/site/lib/demos.ts`.

## How a demo is wired up

Each demo calls the Sixtyfour API directly (synchronous enrichment) and ships these files:

```
demos/<category>/<slug>/
├── main.ts              # Standalone script: reads API key from .env, runs the enrichment
├── README.md            # 2-min setup + extend ideas (the "launching pad")
├── snippets.ts          # JS / Python / cURL canonical snippets shown on the demo page
├── sample-output.json   # Cached result rendered on the demo page before a live run
└── .env.example         # SIXTYFOUR_API_KEY + any demo-specific config
```

The site at `apps/site` reads `lib/demos.ts` (the registry) and renders one card per demo. Each demo page renders `sample-output.json` instantly and then runs a real enrichment on click via SSE — the API key never reaches the browser, every Sixtyfour call goes through `/api/demo/[slug]/run`.

## Add a new demo

1. Pick a category folder under `demos/` (or add one).
2. Create `demos/<category>/<your-slug>/` with the files above. Copy `demos/sales-gtm/icp-qualifier` as a starting point.
3. Add a `Demo` entry to `apps/site/lib/demos.ts` matching your slug. Set `status: "coming-soon"` while you build, flip to `"live"` when ready.
4. Wire it into `apps/site/lib/sample-outputs.ts` and `apps/site/lib/snippets.ts`.
5. Add the SSE dispatch for your slug in `apps/site/app/api/demo/[slug]/run/route.ts`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `SIXTYFOUR_API_KEY` | Yes | Server-only — never exposed to the browser |
| `SIXTYFOUR_API_BASE_URL` | No | Defaults to `https://api.sixtyfour.ai` |
| `NEXT_PUBLIC_SITE_URL` | No | Used by page metadata |

See [.env.example](.env.example).

## Deploy your own copy

The site is a stock Next.js 14 app — works on Vercel out of the box.

1. Fork this repo.
2. Create a Vercel project pointed at the fork.
3. Set the build command to `pnpm turbo run build --filter=site` and the output directory to `apps/site/.next`.
4. Add `SIXTYFOUR_API_KEY` to the project's environment variables.
5. Add a custom domain — CNAME to `cname.vercel-dns.com`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Run `apps/site` locally on port 3000 |
| `pnpm build` | Build everything via Turborepo |
| `pnpm lint` | Lint every workspace |
| `pnpm typecheck` | Typecheck every workspace |
| `pnpm format` | Prettier-format the repo |

## Documentation

- API reference: [docs.sixtyfour.ai](https://docs.sixtyfour.ai/introduction)
- Get an API key: [app.sixtyfour.ai/keys](https://app.sixtyfour.ai/keys)

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).
