"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@sixtyfour-demos/ui";

export interface CodeTabsProps {
  snippets: {
    javascript: string;
    python: string;
    curl: string;
  };
  /** Pre-highlighted HTML from Shiki (server-rendered). If provided, rendered
   *  with dangerouslySetInnerHTML instead of plain text. */
  highlighted?: {
    javascript: string;
    python: string;
    curl: string;
  };
}

export function CodeTabs({ snippets, highlighted }: CodeTabsProps) {
  const [active, setActive] = React.useState<keyof typeof snippets>("javascript");
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippets[active]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("clipboard write failed", err);
    }
  }, [active, snippets]);

  return (
    <Tabs defaultValue="javascript" value={active} onValueChange={(v) => setActive(v as keyof typeof snippets)}>
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="curl">cURL</TabsTrigger>
        </TabsList>
        <Button size="sm" variant="ghost" onClick={onCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <TabsContent value="javascript">
        <CodeBlock code={snippets.javascript} html={highlighted?.javascript} />
      </TabsContent>
      <TabsContent value="python">
        <CodeBlock code={snippets.python} html={highlighted?.python} />
      </TabsContent>
      <TabsContent value="curl">
        <CodeBlock code={snippets.curl} html={highlighted?.curl} />
      </TabsContent>
    </Tabs>
  );
}

function CodeBlock({ code, html }: { code: string; html?: string }) {
  if (html) {
    return (
      <div
        className="shiki-wrapper max-h-[480px] overflow-auto rounded-lg border border-zinc-800 text-xs leading-relaxed [&>pre]:m-0 [&>pre]:rounded-lg [&>pre]:p-4 [&>pre]:font-mono"
        // Shiki inlines background + token colors via style attributes — safe, no user content
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <pre className="max-h-[480px] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200">
      <code className="font-mono">{code}</code>
    </pre>
  );
}
