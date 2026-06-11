import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Built with{" "}
          <Link
            href="https://docs.sixtyfour.ai"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-300 underline-offset-4 hover:text-blue-300 hover:underline"
          >
            Sixtyfour
          </Link>
          . Demos are MIT-licensed.
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="https://github.com/sixtyfour-ai/sixtyfour-demos"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-200"
          >
            GitHub
          </Link>
          <Link
            href="https://docs.sixtyfour.ai"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-200"
          >
            Docs
          </Link>
          <Link href="mailto:support@sixtyfour.ai" className="hover:text-zinc-200">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
