"use client";

import * as React from "react";

interface CopyableCodeBlockProps {
  /** Pre-highlighted HTML from Shiki. */
  html: string;
  /** Raw string written to clipboard. */
  raw: string;
}

export function CopyableCodeBlock({ html, raw }: CopyableCodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [raw]);

  return (
    <div className="mt-2 w-full overflow-hidden rounded-lg border border-zinc-800">
      {/* toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">bash</span>
        <button
          type="button"
          onClick={onCopy}
          className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
          aria-live="polite"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* highlighted code — Shiki sets bg via inline style, we override to match */}
      <div
        className="w-full [&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:rounded-none [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-xs [&>pre]:leading-relaxed"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
