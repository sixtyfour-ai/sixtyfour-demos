import Link from "next/link";
import { Button } from "@sixtyfour-demos/ui";
import { CATEGORIES, getDemosByCategory } from "../lib/demos";
import { DemoCard } from "../components/DemoCard";

export default function HomePage() {
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

      {/* Categories */}
      {CATEGORIES.map((category) => {
        const demos = getDemosByCategory(category.id);
        if (demos.length === 0) return null;
        return (
          <section key={category.id} className="border-b border-zinc-900/60">
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="mb-8 flex flex-col gap-1.5 sm:max-w-2xl">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  {category.name}
                </h2>
                <p className="text-zinc-400">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {demos.map((demo) => (
                  <DemoCard key={demo.slug} demo={demo} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

    </>
  );
}
