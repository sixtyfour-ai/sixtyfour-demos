"use client";

import * as React from "react";
import Link from "next/link";
import { useApiKey, ApiKeyModal } from "./ApiKeyModal";

export function SiteHeader() {
  const { apiKey } = useApiKey();
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <ApiKeyModal open={modalOpen} onClose={() => setModalOpen(false)} />
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
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                apiKey
                  ? "border-blue-800 bg-blue-950/60 text-blue-400 hover:border-blue-600 hover:text-blue-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${apiKey ? "bg-blue-400" : "bg-zinc-600"}`} />
              {apiKey ? "API key set" : "Add API key"}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
