# AGENTS.md

Guidance for AI agents working in this repo. Humans should read [README.md](README.md) instead.

## Read these first, in this order

1. [README.md](README.md) — repo layout, demo wiring, environment variables, deployment.
2. [apps/site/lib/demos.ts](apps/site/lib/demos.ts) — **the registry**. Every demo's slug, category, inputs, Zod schema, sample output path, and output brief lives here. This is the single source of truth.
3. [packages/api-client/src/structs.ts](packages/api-client/src/structs.ts) — all `build*Struct()` functions. Never duplicate field definitions elsewhere.
4. [apps/site/app/api/demo/[slug]/run/route.ts](apps/site/app/api/demo/%5Bslug%5D/run/route.ts) — the SSE dispatch route. One `else if (slug === "...")` branch per live demo.
5. [apps/site/lib/sample-outputs.ts](apps/site/lib/sample-outputs.ts) — static imports of every `sample-output.json`. Must be updated when adding a demo.

## Mental model in 30 seconds

- **Monorepo** (pnpm workspaces + Turborepo): `apps/site` is the Next.js demo hub; `packages/api-client` and `packages/utils` are shared libs; `demos/<category>/<slug>` are standalone runnable scripts.
- **Every demo exists in two forms**: a live web page on `apps/site` (BYOK, SSE streaming) and a standalone TypeScript script in `demos/` (env-file key, `pnpm start`).
- **`demos.ts` is the registry** — a demo is "live" when `status: "live"` is set there. Everything else (routing, sample panel, page generation) follows automatically.
- **The `struct` field is the output contract** — it's a `Record<string, string>` passed to the Sixtyfour API. Keys become fields in `structured_data`; values guide the AI agent on what to find. All struct builders live in `packages/api-client/src/structs.ts`.
- **BYOK on the hosted site** — the API key is passed in the request body as `_api_key`, stripped before Zod validation, and never logged. The server falls back to `SIXTYFOUR_API_KEY` env var for local dev only.
- **SSE not polling** — `POST /api/demo/[slug]/run` holds a long-lived Server-Sent Events connection while calling the Sixtyfour sync endpoint. Results stream back when the enrichment completes. A 4s heartbeat (`ping` event) keeps the connection alive.

## How to add a new demo — the exact checklist

This is the only procedure. Follow it in order; every step is required.

### 1. Add a `build*Struct()` to `packages/api-client/src/structs.ts`

```ts
export function buildMyDemoStruct(): Record<string, string> {
  return {
    field_name: "Plain-English description of what to find and how to format it.",
    // ...
  };
}
```

- Use `'None found' if absent.` as the fallback instruction for optional fields.
- For risk/verdict fields: spell out the exact allowed values (e.g. `"One of: low | medium | high | critical"`).
- For integer fields: say `(integer)` so the API returns a number string, not a sentence.

### 2. Export it from `packages/api-client/src/index.ts`

Add to the existing named export block (keep alphabetical order):

```ts
export {
  buildMyDemoStruct,
  // existing exports...
} from "./structs";
```

### 3. Re-export it from `apps/site/lib/sixtyfour-server.ts`

```ts
export {
  buildMyDemoStruct,
  // existing exports...
} from "@sixtyfour-demos/api-client";
```

### 4. Add the demo entry to `apps/site/lib/demos.ts`

Required fields:
- `slug` — kebab-case, must match the folder name under `demos/<category>/<slug>/`
- `category` — must be one of the `CATEGORIES` ids: `sales-gtm | talent | compliance | security | entity-intel`
- `status: "live"` — set from the start; don't ship a "coming-soon" stub and flip it later
- `inputs` — form fields for the live demo UI; `name` must match keys in the Zod schema
- `inputSchema` — Zod schema validated server-side; optional fields use the pattern below
- `sampleOutputPath` — relative to `demos/` directory (e.g. `"sales-gtm/my-demo/sample-output.json"`)
- `standalonePath` — relative to repo root (e.g. `"demos/sales-gtm/my-demo"`)
- `outputBrief` — 1–2 sentence description of what the demo returns; shown on the demo page

**Optional field Zod pattern** (handles empty string from the form):
```ts
z.string()
  .max(500)
  .transform((v) => v.trim())
  .pipe(z.union([z.literal(""), z.string().email("must be a valid email")]))
  .transform((v) => (v.length > 0 ? v : undefined))
```

**Domain field pattern** (strips protocol and path):
```ts
z.string()
  .min(1, "domain is required")
  .max(200)
  .transform((v) => v.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase())
```

### 5. Add a routing branch to `apps/site/app/api/demo/[slug]/run/route.ts`

Add a new `else if` before the default `else` (ICP qualifier):

```ts
} else if (slug === "my-demo") {
  const input = parsed.data as { domain: string };
  controller.enqueue(
    sseEvent("status", { status: "running", message: `Researching ${input.domain}…`, progress: 15 }),
  );
  console.log("[run/sse] calling /company-intelligence", { slug });
  const myResult = await client.companyIntelligence(
    { target_company: { website: input.domain }, struct: buildMyDemoStruct(), tier: "low" },
    { signal },
  );
  console.log("[run/sse] enrichment complete", { slug, endpoint: "company-intelligence" });
  result = (myResult.structured_data ?? myResult) as Record<string, unknown>;
} else if (slug === "next-existing-demo") {
```

- Use `client.companyIntelligence` for company-domain inputs.
- Use `client.peopleIntelligence` for person-name inputs.
- Always pass `{ signal }` as the second argument so cancellation works.
- Always use `tier: "low"` unless you have a specific reason for medium/high (see tier notes below).
- Always import your struct builder at the top of the file (keep the import list alphabetical).

### 6. Create `demos/<category>/<slug>/sample-output.json`

- Use **Sixtyfour company/person data as the example**: company domain `sixtyfour.ai`, CEO `Saarth Shah`, LinkedIn `https://linkedin.com/in/saarthshah`.
- The JSON should be realistic, well-populated output — not a skeleton. It's what visitors see on first load.
- Every key in the struct should have a value (use `"None found"` for absent optional fields, not `null` or `""`).

### 7. Wire it into `apps/site/lib/sample-outputs.ts`

```ts
import myDemoSample from "../../../demos/my-category/my-demo/sample-output.json";

export const SAMPLE_OUTPUTS: Record<string, unknown> = {
  // existing entries...
  "my-demo": myDemoSample,
};
```

### 8. Create the standalone demo directory

Required files — copy an existing demo (e.g. `demos/compliance/kyb-report`) as a starting point:

```
demos/<category>/<slug>/
├── main.ts           # Standalone script
├── package.json      # @sixtyfour-demos/<slug>, deps: api-client + utils
├── tsconfig.json     # extends ../../../tsconfig.base.json
├── .env.example      # SIXTYFOUR_API_KEY + TARGET_* vars
└── README.md         # 2-min setup + API call exposed + extend ideas
```

**`package.json` template:**
```json
{
  "name": "@sixtyfour-demos/<slug>",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .turbo *.tsbuildinfo",
    "start": "tsx main.ts"
  },
  "dependencies": {
    "@sixtyfour-demos/api-client": "workspace:*",
    "@sixtyfour-demos/utils": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "eslint": "^8.57.0",
    "tsx": "^4.16.2",
    "typescript": "^5.5.3"
  }
}
```

**`main.ts` structure:**
```ts
import { SixtyfourApiError, SixtyfourClient, buildMyDemoStruct } from "@sixtyfour-demos/api-client";
import { loadEnvFile, mustEnv } from "@sixtyfour-demos/utils";

async function main() {
  await loadEnvFile(import.meta.url);   // loads .env relative to this file
  const apiKey = mustEnv("SIXTYFOUR_API_KEY");
  const domain = process.env.TARGET_DOMAIN || "sixtyfour.ai";

  const client = new SixtyfourClient({ apiKey, baseUrl: process.env.SIXTYFOUR_API_BASE_URL });

  console.log(`\n→ Running my demo for ${domain}…\n`);
  const result = await client.companyIntelligence({
    target_company: { website: domain },
    struct: buildMyDemoStruct(),
    tier: "low",
  });

  const data = result.structured_data;
  // print key fields, then: console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  if (err instanceof SixtyfourApiError) {
    console.error(`\n✗ Sixtyfour API error (${err.status}): ${err.message}`);
  } else {
    console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  }
  process.exit(1);
});
```

### 9. Update root `README.md`

- Flip the demo row from `Coming soon` to `Live` with a markdown link to the standalone folder.
- Add the new path to the repo layout tree under `demos/`.

### 10. Run `pnpm install` from repo root

New workspace packages aren't linked until `pnpm install` runs. If you skip this, TypeScript will show "Cannot find module '@sixtyfour-demos/api-client'" in the new demo even though the dep is declared.

### 11. Verify

```bash
pnpm typecheck   # must be green for all N packages
pnpm lint        # must be green, zero warnings
```

---

## Invariants — do not break these

1. **`demos.ts` is the only registry.** The page router, sample panel, API route guard, and static params all derive from it. Never hardcode a slug anywhere else.

2. **Struct builders live only in `packages/api-client/src/structs.ts`.** Never put field definitions in `route.ts`, standalone `main.ts`, or anywhere else. They're imported from the package everywhere.

3. **The `_api_key` field is stripped before Zod validation.** Do not add `_api_key` to any demo's `inputSchema`. It's handled in `route.ts` before `demo.inputSchema.safeParse(inputBody)` is called.

4. **Optional form fields must use `.nullish()`-tolerant Zod patterns.** Empty strings from optional inputs must not cause a 422. Use the `.transform().pipe(z.union([z.literal(""), ...]))` pattern shown above, not plain `.optional()`.

5. **Default examples always use Sixtyfour data.** `placeholder`, `defaultValue` in `demos.ts`, env var defaults in `main.ts`, and `sample-output.json` content must all use `sixtyfour.ai`, `Saarth Shah`, `saarth@sixtyfour.ai`, `https://linkedin.com/in/saarthshah`.

6. **`tier: "low"` is the default.** It runs in 15–60s and stays within Vercel's function timeout. Do not use `"medium"` or `"high"` in the web demo route without documenting why — higher tiers can exceed the 300s Vercel limit.

7. **Never log the API key.** `getSixtyfourClient` accepts the key and passes it to the client. Never `console.log` it in route handlers or scripts.

8. **`pnpm dev` uses no fixed port.** The `apps/site` `dev` script is `next dev` (no `--port` flag). Next.js auto-selects the next available port starting at 3000.

---

## Sixtyfour API quick reference

| Endpoint | Use for | Key input fields |
|---|---|---|
| `POST /company-intelligence` | Any company-domain demo | `target_company: { website }`, `struct`, `tier` |
| `POST /people-intelligence` | Any person-name demo | `lead_info: { full_name, company?, email?, linkedin_url? }`, `struct`, `tier` |
| `POST /company-intelligence-async` | Future: async company jobs | Returns `{ task_id }` immediately |
| `POST /people-intelligence-async` | Future: async people jobs | Returns `{ task_id }` immediately |
| `GET /job-status/{task_id}` | Future: poll async jobs | Returns `{ status, result }` when done |

**Response shape (sync endpoints):**
```ts
{
  structured_data: Record<string, string>,  // your struct keys, filled in
  confidence_score: number,                  // 0–10
  references: Record<string, string>,        // source URL → description
  notes: string,                             // research commentary
}
```

**Async polling note (TODO in `route.ts`):** `status` is case-inconsistent. Submit returns `"RUNNING"` (uppercase); polls return `"running"` (lowercase). Always normalize with `.toLowerCase()` before comparing. Verified working as of 2026-06-12.

---

## Tier guide

| Tier | Typical latency | Use when |
|---|---|---|
| `"low"` | 15–60s | Default for all demos. Fast enough for live interaction. |
| `"medium"` | 60–180s | Harder targets, private companies, limited online presence. Not safe on Vercel without async. |
| `"high"` | 180–300s+ | Deepest coverage. Enterprise only. Never use in sync web demo route. |

If a demo concept genuinely needs medium/high tier (e.g. deep OSINT on obscure subjects), it must use the async pattern — submit job, return `task_id`, client polls — not the current SSE hold.

---

## Common mistakes to avoid

| Mistake | Correct approach |
|---|---|
| Duplicating struct fields in `main.ts` or `route.ts` | Import `build*Struct()` from `@sixtyfour-demos/api-client` |
| Using `clay.com` or non-Sixtyfour data as the default/example | Always use `sixtyfour.ai`, `Saarth Shah`, etc. |
| Adding `_api_key` to a demo's `inputSchema` | It's stripped automatically before schema validation |
| Setting `--port 3000` in `next dev` | Use `next dev` with no port flag |
| Skipping `pnpm install` after adding a new demo package | New workspace deps aren't linked until install runs |
| Using `.optional()` alone for nullable form fields | Use the `.transform().pipe()` pattern — empty strings from forms fail plain `.optional()` |
| Placing a new demo's struct in the wrong file | Structs only go in `packages/api-client/src/structs.ts` |
| Adding a demo to `demos.ts` but not to `sample-outputs.ts` | Both must be updated together |
| Forgetting to export the struct from `index.ts` | The standalone `main.ts` imports from `@sixtyfour-demos/api-client`, which re-exports from `index.ts` |

---

## File map

```
apps/site/
  app/
    api/demo/[slug]/run/route.ts   ← SSE dispatch — one branch per live demo
  lib/
    demos.ts                        ← THE REGISTRY — start here for any demo work
    sample-outputs.ts               ← static JSON imports, one entry per live demo
    sixtyfour-server.ts             ← getSixtyfourClient + re-exports all struct builders
    snippets.ts                     ← code tab snippets (JS/Python/cURL) — optional per demo
  components/
    LiveDemo.tsx                    ← SSE client, input form, result panel, cancel logic
    ApiKeyModal.tsx                 ← BYOK key management + ApiKeyProvider context

packages/
  api-client/src/
    client.ts                       ← SixtyfourClient (fetch wrapper, no env reads)
    structs.ts                      ← ALL build*Struct() functions
    index.ts                        ← re-exports everything from the package
    types.ts                        ← request/response TypeScript types
    errors.ts                       ← SixtyfourApiError
  utils/src/
    env.ts                          ← mustEnv(), loadEnvFile() for standalone scripts

demos/<category>/<slug>/
  main.ts                           ← standalone runnable script
  package.json                      ← @sixtyfour-demos/<slug>
  tsconfig.json                     ← extends ../../../tsconfig.base.json
  .env.example                      ← SIXTYFOUR_API_KEY + TARGET_* vars
  sample-output.json                ← realistic Sixtyfour-data output
  README.md                         ← 2-min setup + API call exposed + extend ideas
```
