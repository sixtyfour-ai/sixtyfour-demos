import Link from "next/link";
import { Button } from "@sixtyfour-demos/ui";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        404
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-zinc-100">Page not found.</h1>
      <p className="mt-3 text-zinc-400">The demo you&apos;re looking for doesn&apos;t exist.</p>
      <div className="mt-8 flex justify-center">
        <Link href="/">
          <Button variant="primary">Back to demos</Button>
        </Link>
      </div>
    </section>
  );
}
