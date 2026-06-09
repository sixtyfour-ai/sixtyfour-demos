import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, CardContent } from "@sixtyfour-demos/ui";
import { buildCopyForLlmPrompt } from "@sixtyfour-demos/utils";
import { CATEGORIES, DEMOS, getDemoBySlug, getRelatedDemos } from "../../../lib/demos";
import { getSampleOutput } from "../../../lib/sample-outputs";
import { getSnippetsForSlug } from "../../../lib/snippets";
import { highlightSnippets } from "../../../lib/highlight";
import { LiveDemo } from "../../../components/LiveDemo";
import { CodeTabs } from "../../../components/CodeTabs";
import { CopyForLLMButton } from "../../../components/CopyForLLMButton";
import { DemoCard } from "../../../components/DemoCard";

export function generateStaticParams() {
  return DEMOS.filter((d) => d.status === "live").map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const demo = getDemoBySlug(params.slug);
  if (!demo || demo.status !== "live") return { title: "Demo not found" };
  return {
    title: demo.title,
    description: demo.oneLiner,
  };
}

export default async function DemoPage({ params }: { params: { slug: string } }) {
  const demo = getDemoBySlug(params.slug);
  if (!demo || demo.status !== "live") {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === demo.category);
  const sample = getSampleOutput(demo.slug);
  const snippets = getSnippetsForSlug(demo.slug);
  const related = getRelatedDemos(demo, 2);
  const { inputSchema: _inputSchema, ...demoData } = demo;
  const githubUrl = `https://github.com/sixtyfour-ai/sixtyfour-demos/tree/main/${demo.standalonePath ?? ""}`;
  const llmPrompt = snippets
    ? buildCopyForLlmPrompt({
        demoTitle: demo.title,
        demoSlug: demo.slug,
        jsSnippet: snippets.javascript,
      })
    : "";

  const highlighted = snippets ? await highlightSnippets(snippets) : undefined;

  return (
    <article className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <header className="border-b border-zinc-900/80 pb-10">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300"
          >
            Demos
          </Link>
          <span className="text-zinc-700">/</span>
          {category && (
            <span className="font-mono uppercase tracking-widest text-blue-400">
              {category.name}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          {demo.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-zinc-400">{demo.oneLiner}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={githubUrl} target="_blank" rel="noreferrer">
            <Button variant="outline">View on GitHub</Button>
          </Link>
          {snippets && <CopyForLLMButton prompt={llmPrompt} />}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {demo.tags.map((tag) => (
            <Badge key={tag} className="font-mono text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* Live demo */}
      <section className="py-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Try it
        </h2>
        <LiveDemo demo={demoData} initialResult={sample} />
      </section>

      {/* Code snippets */}
      {snippets && (
        <section className="border-t border-zinc-900/60 py-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Copy code
          </h2>
          <CodeTabs snippets={snippets} highlighted={highlighted} />
        </section>
      )}

      {/* Output schema */}
      {demo.outputBrief && (
        <section className="border-t border-zinc-900/60 py-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            What you get back
          </h2>
          <p className="max-w-3xl text-zinc-300">{demo.outputBrief}</p>
        </section>
      )}

      {/* Run locally */}
      <section className="border-t border-zinc-900/60 py-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Run locally
        </h2>
        <p className="max-w-3xl text-zinc-300">
          Clone the repo, set your API key, provision the workflow, and run the standalone script:
        </p>
        <pre className="mt-4 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200">
          <code className="font-mono">{demo.mode === "direct"
            ? `git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/${demo.standalonePath ?? ""}
cp .env.example .env
# paste your SIXTYFOUR_API_KEY into .env

pnpm install
pnpm start`
            : `git clone https://github.com/sixtyfour-ai/sixtyfour-demos.git
cd sixtyfour-demos/${demo.standalonePath ?? ""}
cp .env.example .env
# paste your SIXTYFOUR_API_KEY into .env

# Provision the workflow once:
pnpm install
pnpm provision

# Run the demo:
pnpm start`}</code>
        </pre>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-zinc-900/60 py-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Related demos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((d) => (
              <DemoCard key={d.slug} demo={d} />
            ))}
          </div>
        </section>
      )}

      {/* Coming soon hint if snippets aren't wired yet */}
      {!snippets && (
        <Card>
          <CardContent className="p-6">
            <p className="text-zinc-300">
              Snippets are still being authored for this demo. Watch the{" "}
              <Link
                href="https://github.com/sixtyfour-ai/sixtyfour-demos"
                target="_blank"
                rel="noreferrer"
                className="text-blue-300 underline-offset-4 hover:underline"
              >
                GitHub repo
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}
    </article>
  );
}
