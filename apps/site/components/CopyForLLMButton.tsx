"use client";

import * as React from "react";
import { Button } from "@sixtyfour-demos/ui";

interface CopyForLLMButtonProps {
  prompt: string;
  className?: string;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyForLLMButton({ prompt, className }: CopyForLLMButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const resetTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const onCopy = React.useCallback(async () => {
    setCopied(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    try {
      await copyText(prompt);
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("clipboard write failed", err);
      setCopied(false);
    }
  }, [prompt]);

  return (
    <Button type="button" variant="secondary" onClick={onCopy} aria-live="polite" className={className}>
      {copied ? "Copied" : "Copy agent prompt"}
    </Button>
  );
}
