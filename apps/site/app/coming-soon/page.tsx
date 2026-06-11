import Link from "next/link";
import { Button } from "@sixtyfour-demos/ui";
import { DEMOS, getDemoBySlug } from "../../lib/demos";

interface PageProps {
  searchParams?: { demo?: string };
}

export const metadata = {
  title: "Coming soon",
  description: "This demo is on the way. Subscribe for updates.",
};

export default function ComingSoonPage({ searchParams }: PageProps) {
  const demoSlug = searchParams?.demo;
  const demo = demoSlug ? getDemoBySlug(demoSlug) : undefined;
  const liveDemos = DEMOS.filter((d) => d.status === "live");

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Coming soon
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-50">
        {demo ? demo.title : "This demo"} is on the way.
      </h1>
      <p className="mt-4 text-lg text-zinc-400">
        {demo?.oneLiner ??
          "We're building it now. Star the repo on GitHub to get pinged when it ships."}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/">
          <Button variant="primary">Back to demos</Button>
        </Link>
        <Link
          href="https://github.com/sixtyfour-ai/sixtyfour-demos"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline">Star on GitHub</Button>
        </Link>
      </div>

      {liveDemos.length > 0 && (
        <div className="mt-16 border-t border-zinc-900 pt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Available now
          </h2>
          <ul className="mt-4 space-y-3">
            {liveDemos.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/demos/${d.slug}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 transition-colors hover:border-blue-400/30"
                >
                  <p className="font-medium text-zinc-100">{d.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{d.oneLiner}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
