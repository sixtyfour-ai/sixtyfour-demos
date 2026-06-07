import Link from "next/link";
import { Button } from "@sixtyfour-demos/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
          Sixtyfour Demos
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="https://docs.sixtyfour.ai"
            target="_blank"
            rel="noreferrer"
            className="hidden text-zinc-400 hover:text-zinc-100 sm:inline"
          >
            Docs
          </Link>
          <Link
            href="https://github.com/sixtyfour-ai/sixtyfour-demos"
            target="_blank"
            rel="noreferrer"
            className="hidden text-zinc-400 hover:text-zinc-100 sm:inline"
          >
            GitHub
          </Link>
          <Link href="https://app.sixtyfour.ai/keys" target="_blank" rel="noreferrer">
            <Button size="sm" variant="primary">
              Get API key
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
