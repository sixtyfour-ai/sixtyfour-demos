import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Require an env var; print a helpful message and exit if missing. */
export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(
      `\n✗ ${name} is not set. ` +
        `Copy .env.example to .env, fill in your values, then re-run \`pnpm start\`.`,
    );
    process.exit(1);
  }
  return v;
}

/**
 * Load `.env` from the directory containing the caller's module (e.g. `import.meta.url`).
 * Does not overwrite keys already set in `process.env`.
 */
export async function loadEnvFile(importMetaUrl: string): Promise<void> {
  const envPath = resolve(dirname(fileURLToPath(importMetaUrl)), ".env");
  let text: string;
  try {
    text = await readFile(envPath, "utf8");
  } catch {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
