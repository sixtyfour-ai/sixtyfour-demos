"use client";

import * as React from "react";
import { Badge, Button, Card, CardContent } from "@sixtyfour-demos/ui";
import type { Demo } from "../lib/demos";
import { useApiKey, ApiKeyModal } from "./ApiKeyModal";

export type SerializableDemo = Omit<Demo, "inputSchema">;
import { formatPercent } from "../lib/utils";

interface LiveDemoProps {
  demo: SerializableDemo;
  initialResult: unknown;
  /** Pre-highlighted HTML for the initial sample (server-rendered). */
  initialHighlightedResult?: string;
}

interface RunState {
  status: "idle" | "starting" | "running" | "completed" | "failed";
  progress: number;
  message: string;
  error: string | null;
  result: unknown;
  startedAt: number | null;
  log: string[];
  requestBody: Record<string, string> | null;
}


export function LiveDemo({ demo, initialResult, initialHighlightedResult }: LiveDemoProps) {
  const [form, setForm] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(demo.inputs.map((i) => [i.name, i.defaultValue ?? ""])),
  );
  const [run, setRun] = React.useState<RunState>({
    status: "idle",
    progress: 0,
    message: "",
    error: null,
    result: initialResult,
    startedAt: null,
    log: [],
    requestBody: null,
  });
  const [elapsed, setElapsed] = React.useState(0);
  const [debugOpen, setDebugOpen] = React.useState(false);
  const cancelledRef = React.useRef(false);
  const { apiKey } = useApiKey();
  const [keyModalOpen, setKeyModalOpen] = React.useState(false);
  // Highlighted JSON for the result panel — starts with the server-pre-highlighted sample,
  // then updates client-side via Shiki whenever a live result lands.
  const [highlightedResult, setHighlightedResult] = React.useState<string | undefined>(
    initialHighlightedResult,
  );

  React.useEffect(() => {
    if (run.result === null || run.result === undefined) {
      setHighlightedResult(initialHighlightedResult);
      return;
    }
    // Skip re-highlighting the initial sample (already pre-highlighted server-side)
    if (run.result === initialResult) {
      setHighlightedResult(initialHighlightedResult);
      return;
    }
    // Highlight live result client-side
    import("shiki").then(({ codeToHtml }) =>
      codeToHtml(JSON.stringify(run.result, null, 2), {
        lang: "json",
        theme: "github-dark",
      }),
    ).then(setHighlightedResult).catch(() => {
      setHighlightedResult(undefined);
    });
  }, [run.result, initialResult, initialHighlightedResult]);

  const onCancel = () => {
    cancelledRef.current = true;
    setRun((r) => ({
      ...r,
      status: "idle",
      progress: 0,
      message: "",
      error: null,
      result: initialResult,
      startedAt: null,
      log: [],
      requestBody: null,
    }));
    setElapsed(0);
  };

  const onClear = () => {
    setRun((r) => ({
      ...r,
      status: "idle",
      progress: 0,
      message: "",
      error: null,
      result: initialResult,
      startedAt: null,
      log: [],
      requestBody: null,
    }));
    setElapsed(0);
    setDebugOpen(false);
  };

  // Tick elapsed seconds while running
  React.useEffect(() => {
    if (!run.startedAt || run.status === "completed" || run.status === "failed") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - run.startedAt!) / 1000)), 1000);
    return () => clearInterval(id);
  }, [run.startedAt, run.status]);

  const onChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setKeyModalOpen(true);
      return;
    }
    setRun({
      status: "starting",
      progress: 0,
      message: "Submitting…",
      error: null,
      result: null,
      startedAt: Date.now(),
      log: [],
      requestBody: form,
    });
    setElapsed(0);
    cancelledRef.current = false;
    try {
      await runDirect(demo.slug, form, apiKey, setRun, cancelledRef);
    } catch (err) {
      setRun((r) => ({
        ...r,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
      setDebugOpen(true);
    }
  };

  const isRunning = run.status === "starting" || run.status === "running";
  const isUsingSample = run.result === initialResult && run.status === "idle";

  return (
    <>
    <ApiKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Input form */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Input
          </h3>
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            {demo.inputs.map((input) => (
              <div key={input.name} className="space-y-1.5">
                <label
                  htmlFor={input.name}
                  className="text-sm font-medium text-zinc-200"
                >
                  {input.label}
                </label>
                {input.type === "textarea" ? (
                  <textarea
                    id={input.name}
                    name={input.name}
                    placeholder={input.placeholder}
                    value={form[input.name] ?? ""}
                    onChange={onChange(input.name)}
                    rows={4}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                  />
                ) : (
                  <input
                    id={input.name}
                    name={input.name}
                    type={input.type}
                    placeholder={input.placeholder}
                    value={form[input.name] ?? ""}
                    onChange={onChange(input.name)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                  />
                )}
                {input.description && (
                  <p className="text-xs text-zinc-500">{input.description}</p>
                )}
              </div>
            ))}
            {!apiKey && !isRunning && (
              <button
                type="button"
                onClick={() => setKeyModalOpen(true)}
                className="flex w-full items-center gap-2 rounded-md border border-amber-800/60 bg-amber-950/40 px-3 py-2.5 text-left text-sm text-amber-300 transition-colors hover:border-amber-700 hover:bg-amber-950/60"
              >
                <span className="text-base leading-none">⚠</span>
                <span>Add your Sixtyfour API key to run this demo</span>
              </button>
            )}
            {apiKey && !isRunning && (
              <button
                type="button"
                onClick={() => setKeyModalOpen(true)}
                className="flex w-full items-center gap-2 rounded-md border border-green-800/60 bg-green-950/40 px-3 py-2.5 text-left text-sm text-green-400 transition-colors hover:border-green-700 hover:bg-green-950/60"
              >
                <span className="text-base leading-none">✓</span>
                <span>API key added</span>
              </button>
            )}
            <Button type="submit" disabled={isRunning} className="w-full">
              {isRunning ? "Running…" : "Run demo"}
            </Button>
            {isRunning && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-md border border-zinc-700 bg-transparent py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
              >
                Cancel
              </button>
            )}
            {run.status === "failed" && (
              <button
                type="button"
                onClick={onClear}
                className="w-full rounded-md border border-zinc-700 bg-transparent py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Output panel */}
      <Card className="lg:col-span-3">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
              Output
            </h3>
            {isUsingSample && (
              <Badge variant="muted" className="font-mono">
                cached sample
              </Badge>
            )}
            {run.status === "completed" && (
              <Badge variant="success" className="font-mono">
                live · completed
              </Badge>
            )}
            {isRunning && (
              <Badge variant="warning" className="font-mono">
                live · {formatPercent(run.progress)}
              </Badge>
            )}
            {run.status === "failed" && (
              <Badge variant="warning" className="font-mono">
                error
              </Badge>
            )}
          </div>

          {isRunning && (
            <ProgressBar
              percent={run.progress}
              label={run.message || "Running…"}
              elapsed={elapsed}
            />
          )}

          {isRunning && run.log.length > 0 && (
            <ActivityLog entries={run.log} />
          )}

          {run.status === "failed" && (
            <div className="rounded-md border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-200">
              <p className="font-medium">Run failed</p>
              <p className="mt-1 text-red-300/80">{run.error}</p>
            </div>
          )}

          <ResultPanel result={run.result} highlightedHtml={highlightedResult} />
        </CardContent>
      </Card>
    </div>

    {/* Debug panel — shown after any run starts */}
    {run.requestBody !== null && (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setDebugOpen((o) => !o)}
          className="flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          <span className={`inline-block transition-transform duration-150 ${debugOpen ? "rotate-90" : ""}`}>▶</span>
          Debug
        </button>
        {debugOpen && (
          <div className="mt-3 space-y-3">
            <DebugBlock label="Request" badge="POST /company-intelligence or /people-intelligence">
              {JSON.stringify(run.requestBody, null, 2)}
            </DebugBlock>
            {run.log.length > 0 && (
              <DebugBlock label={`Activity log (${run.log.length} events)`}>
                {run.log.join("\n")}
              </DebugBlock>
            )}
            {run.error && (
              <DebugBlock label="Error" highlight>
                {run.error}
              </DebugBlock>
            )}
          </div>
        )}
      </div>
    )}
  </>
  );
}

function ProgressBar({ percent, label, elapsed }: { percent: number; label: string; elapsed: number }) {
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const elapsedStr = mins > 0
    ? `${mins}m ${secs.toString().padStart(2, "0")}s`
    : `${secs}s`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-500">{elapsedStr}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full rounded-full bg-blue-400 transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
        />
      </div>
      <p className="text-[11px] text-zinc-600">
        Company research can take 5–30 min — keep this tab open.
      </p>
    </div>
  );
}

function ResultPanel({ result, highlightedHtml }: { result: unknown; highlightedHtml?: string }) {
  if (result === null || result === undefined) {
    return <SkeletonResult />;
  }
  if (highlightedHtml) {
    return (
      <div
        className="shiki-wrapper max-h-[420px] overflow-auto rounded-lg border border-zinc-800 text-xs leading-relaxed [&>pre]:m-0 [&>pre]:rounded-lg [&>pre]:p-4 [&>pre]:font-mono [&>pre]:whitespace-pre-wrap [&>pre]:break-words"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    );
  }
  return (
    <pre className="max-h-[420px] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">
      <code className="font-mono">{JSON.stringify(result, null, 2)}</code>
    </pre>
  );
}

function SkeletonResult() {
  return (
    <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      {[80, 64, 92, 56, 70].map((w, i) => (
        <div
          key={i}
          className="h-3 animate-result-pulse rounded bg-zinc-900"
          style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function ActivityLog({ entries }: { entries: string[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  return (
    <div
      ref={ref}
      className="max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs"
    >
      {entries.map((line, i) => (
        <div key={i} className="flex gap-2 leading-relaxed">
          <span className="shrink-0 text-zinc-700">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-zinc-400">{line}</span>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-1.5 text-blue-400">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
        <span>working…</span>
      </div>
    </div>
  );
}

async function runDirect(
  slug: string,
  form: Record<string, string>,
  apiKey: string,
  setRun: React.Dispatch<React.SetStateAction<RunState>>,
  cancelledRef: React.RefObject<boolean>,
) {
  const start = Date.now();

  // #region agent log
  fetch('http://127.0.0.1:7721/ingest/1fd34063-8b17-4dba-a9e0-2f8515df0bbb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'228a5f'},body:JSON.stringify({sessionId:'228a5f',location:'LiveDemo.tsx:runDirect-entry',message:'runDirect called',data:{slug,formKeys:Object.keys(form),apiKeyLen:apiKey.length,apiKeyPresent:apiKey.length>0},hypothesisId:'H-A,H-E',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const res = await fetch(`/api/demo/${slug}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, _api_key: apiKey }),
  });

  // #region agent log
  fetch('http://127.0.0.1:7721/ingest/1fd34063-8b17-4dba-a9e0-2f8515df0bbb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'228a5f'},body:JSON.stringify({sessionId:'228a5f',location:'LiveDemo.tsx:runDirect-response',message:'fetch response received',data:{status:res.status,ok:res.ok,hasBody:!!res.body,contentType:res.headers.get('content-type')},hypothesisId:'H-C,H-D',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // Non-streaming error (e.g. 422 validation, 503 no API key)
  if (!res.ok || !res.body) {
    const json = await res.json() as Record<string, unknown>;
    const issues = json.issues as Array<{ path: string; message: string }> | undefined;
    const detail = issues?.map((i) => `${i.path}: ${i.message}`).join("; ");
    throw new Error(detail ?? (json.error as string) ?? `Run failed (${res.status})`);
  }

  setRun((r) => ({ ...r, status: "running", message: "Agent started…" }));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (cancelledRef.current) {
      reader.cancel().catch(() => undefined);
      return;
    }

    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";  // keep incomplete last line in buffer

    let pendingEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        pendingEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const rawData = line.slice(6).trim();
        let data: Record<string, unknown> = {};
        try { data = JSON.parse(rawData) as Record<string, unknown>; } catch { /* ignore */ }

        const elapsed = Math.floor((Date.now() - start) / 1000);
        const ts = elapsed >= 60
          ? `+${Math.floor(elapsed / 60)}m${(elapsed % 60).toString().padStart(2, "0")}s`
          : `+${elapsed}s`;

        if (pendingEvent === "status" || pendingEvent === "ping") {
          setRun((r) => ({
            ...r,
            progress: (data.progress as number) ?? r.progress,
            message: (data.message as string) ?? r.message,
            log: [...r.log, `[${ts}]  ${pendingEvent === "ping" ? "♥" : "→"}  ${(data.message as string) ?? "running"}`],
          }));
        } else if (pendingEvent === "result") {
          setRun((r) => ({
            ...r,
            status: "completed",
            progress: 100,
            message: "Done",
            result: data.result,
            log: [...r.log, `[${ts}]  ✓  completed`],
          }));
        } else if (pendingEvent === "error") {
          throw new Error((data.error as string) ?? "Enrichment failed");
        }
        pendingEvent = "";
      }
    }
  }
}

function DebugBlock({
  label,
  badge,
  highlight,
  children,
}: {
  label: string;
  badge?: string;
  highlight?: boolean;
  children: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 text-xs">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-1.5">
        <span className="font-mono font-medium text-zinc-400">{label}</span>
        {badge && (
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-500">{badge}</span>
        )}
      </div>
      <pre
        className={`overflow-x-auto whitespace-pre-wrap break-all px-3 py-2 font-mono leading-relaxed ${
          highlight ? "text-red-400" : "text-zinc-300"
        }`}
      >
        {children}
      </pre>
    </div>
  );
}
