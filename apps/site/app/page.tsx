import Link from "next/link";
import { Button } from "@sixtyfour-demos/ui";
import { CATEGORIES, DEMOS } from "../lib/demos";
import { DemoCard } from "../components/DemoCard";

// Each row lists the category IDs it groups; label is derived from those categories.
const ROWS: { categoryIds: string[]; slugs: string[] }[] = [
  {
    categoryIds: ["entity-intel"],
    slugs: ["founder-background-check", "competitive-org-intel"],
  },
  {
    categoryIds: ["security", "compliance"],
    slugs: ["threat-actor-footprint", "kyb-report"],
  },
  {
    categoryIds: ["sales-gtm", "talent"],
    slugs: ["icp-qualifier", "passive-candidate-finder"],
  },
];

const categoryLabelById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

export default function HomePage() {
  const demosBySlug = Object.fromEntries(DEMOS.map((d) => [d.slug, d]));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-900/80 bg-grid">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1 text-xs text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Open-source · MIT
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
              Build with Sixtyfour
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-zinc-400">
              Working examples for Sixtyfour APIs. Start here, build anything.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="https://app.sixtyfour.ai/keys" target="_blank" rel="noreferrer">
                <Button variant="primary" size="lg">
                  Get an API key
                </Button>
              </Link>
              <Link
                href="https://github.com/sixtyfour-ai/sixtyfour-demos"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="lg">
                  View on GitHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo rows */}
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">
        {ROWS.map(({ categoryIds, slugs }) => {
          const label = categoryIds.map((id) => categoryLabelById[id]).join(" · ");
          const demos = slugs.map((s) => demosBySlug[s]).filter((d): d is NonNullable<typeof d> => !!d);
          return (
            <div key={label}>
              <div className="mb-6 flex items-center gap-4">
                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  {label}
                </span>
                <div className="flex-1 border-t border-zinc-800" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {demos.map((demo) => (
                  <DemoCard key={demo.slug} demo={demo} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
