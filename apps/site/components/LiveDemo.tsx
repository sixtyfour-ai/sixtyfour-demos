"use client";

import * as React from "react";
import { Badge, Button, Card, CardContent } from "@sixtyfour-demos/ui";
import type { Demo } from "../lib/demos";

export type SerializableDemo = Omit<Demo, "inputSchema">;
import { formatPercent } from "../lib/utils";

interface LiveDemoProps {
  demo: SerializableDemo;
  initialResult: unknown;
}

interface RunState {
  jobId: string | null;
  status: "idle" | "starting" | "running" | "completed" | "failed";
  progress: number;
  message: string;
  error: string | null;
  result: unknown;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 5 * 60 * 1000;

export function LiveDemo({ demo, initialResult }: LiveDemoProps) {
  const [form, setForm] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(demo.inputs.map((i) => [i.name, i.defaultValue ?? ""])),
  );
  const [run, setRun] = React.useState<RunState>({
    jobId: null,
    status: "idle",
    progress: 0,
    message: "",
    error: null,
    result: initialResult,
  });

  const onChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRun({
      jobId: null,
      status: "starting",
      progress: 0,
      message: "Submitting…",
      error: null,
      result: null,
    });
    try {
      const res = await fetch(`/api/demo/${demo.slug}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `Run failed (${res.status})`);
      }
      const jobId: string = json.job_id ?? json.task_id;
      const mode: string = json.mode ?? "workflow";
      setRun((r) => ({ ...r, jobId, status: "running", message: "Running…" }));
      await pollUntilComplete(demo.slug, jobId, mode, setRun);
    } catch (err) {
      setRun((r) => ({
        ...r,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  };

  const isRunning = run.status === "starting" || run.status === "running";
  const isUsingSample = run.result === initialResult && run.status === "idle";

  return (
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
            <Button type="submit" disabled={isRunning} className="w-full">
              {isRunning ? "Running…" : "Run demo"}
            </Button>
            <p className="text-[11px] text-zinc-600">
              Real Sixtyfour run · uses your API key configured on the site
            </p>
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
            />
          )}

          {run.status === "failed" && (
            <div className="rounded-md border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-200">
              <p className="font-medium">Run failed</p>
              <p className="mt-1 text-red-300/80">{run.error}</p>
            </div>
          )}

          <ResultPanel result={run.result} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-500">{formatPercent(percent)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full rounded-full bg-blue-400 transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
        />
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: unknown }) {
  if (result === null || result === undefined) {
    return <SkeletonResult />;
  }
  return (
    <pre className="max-h-[420px] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200">
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

async function pollUntilComplete(
  slug: string,
  jobId: string,
  mode: string,
  setRun: React.Dispatch<React.SetStateAction<RunState>>,
) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - start > MAX_POLL_DURATION_MS) {
      throw new Error("Polling timed out after 5 minutes");
    }
    await sleep(POLL_INTERVAL_MS);
    const res = await fetch(
      `/api/demo/${slug}/status?job_id=${encodeURIComponent(jobId)}&mode=${mode}`,
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? `Status check failed (${res.status})`);
    }
    setRun((r) => ({
      ...r,
      progress: json.progress ?? r.progress,
      message: json.message ?? r.message,
    }));
    if (json.status === "completed") {
      setRun((r) => ({
        ...r,
        status: "completed",
        progress: 100,
        message: "Done",
        result: json.result,
      }));
      return;
    }
    if (json.status === "failed" || json.status === "cancelled") {
      throw new Error(json.error ?? `Run ${json.status}`);
    }
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
