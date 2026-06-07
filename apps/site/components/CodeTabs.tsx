"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@sixtyfour-demos/ui";

export interface CodeTabsProps {
  snippets: {
    javascript: string;
    python: string;
    curl: string;
  };
}

export function CodeTabs({ snippets }: CodeTabsProps) {
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
        <CodeBlock code={snippets.javascript} />
      </TabsContent>
      <TabsContent value="python">
        <CodeBlock code={snippets.python} />
      </TabsContent>
      <TabsContent value="curl">
        <CodeBlock code={snippets.curl} />
      </TabsContent>
    </Tabs>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="max-h-[480px] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200">
      <code className="font-mono">{code}</code>
    </pre>
  );
}
