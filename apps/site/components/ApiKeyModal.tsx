"use client";

import * as React from "react";

const STORAGE_KEY = "sixtyfour_api_key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = React.useState<string>("");

  // Read from sessionStorage once mounted (avoids SSR mismatch)
  React.useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY) ?? "";
    setApiKeyState(stored);
  }, []);

  const setApiKey = React.useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      sessionStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(trimmed);
  }, []);

  return { apiKey, setApiKey };
}

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const { apiKey, setApiKey } = useApiKey();
  const [draft, setDraft] = React.useState(apiKey);

  // Sync draft when modal opens
  React.useEffect(() => {
    if (open) setDraft(sessionStorage.getItem(STORAGE_KEY) ?? "");
  }, [open]);

  const onSave = () => {
    setApiKey(draft);
    onClose();
  };

  const onClear = () => {
    setApiKey("");
    setDraft("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
            API Key
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 transition-colors hover:text-zinc-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-400">
          Your key is stored in this browser session only — it clears when you close the tab and is never sent to our servers except as part of a demo run you initiate.
        </p>
        <p className="mb-4 text-sm">
          <a
            href="https://app.sixtyfour.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            Get a free API key →
          </a>
        </p>

        <input
          type="password"
          placeholder="sk-…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          autoFocus
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          {apiKey && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Clear saved key
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!draft.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
