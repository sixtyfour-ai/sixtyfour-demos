"use client";

import * as React from "react";
import { Button } from "@sixtyfour-demos/ui";

interface CopyForLLMButtonProps {
  prompt: string;
  className?: string;
}

export function CopyForLLMButton({ prompt, className }: CopyForLLMButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("clipboard write failed", err);
    }
  }, [prompt]);

  return (
    <Button type="button" variant="secondary" onClick={onCopy} aria-live="polite" className={className}>
      {copied ? "Copied" : "Copy agent prompt"}
    </Button>
  );
}
