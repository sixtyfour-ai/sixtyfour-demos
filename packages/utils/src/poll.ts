import type { LiveStatusResponse, SixtyfourClient } from "@sixtyfour-demos/api-client";

export interface PollWorkflowOptions {
  /** Initial delay between polls (ms). Default 2000. */
  initialIntervalMs?: number;
  /** Cap on the polling interval (ms). Default 8000. */
  maxIntervalMs?: number;
  /** Backoff multiplier applied to the interval each loop. Default 1.3. */
  backoffFactor?: number;
  /** Hard stop after this many ms. Default 5 minutes. */
  timeoutMs?: number;
  /** Optional callback fired on every status snapshot. */
  onTick?: (status: LiveStatusResponse) => void;
  /** Abort signal — when fired, the poll rejects with an AbortError. */
  signal?: AbortSignal;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

/**
 * Poll `/workflows/runs/{job_id}/live_status` until the run reaches a terminal
 * state, then return the final status snapshot.
 *
 * Uses gentle exponential backoff so a long-running workflow doesn't hammer
 * the API. Caller is responsible for fetching the result CSV after this
 * resolves.
 */
export async function pollWorkflow(
  client: SixtyfourClient,
  jobId: string,
  options: PollWorkflowOptions = {},
): Promise<LiveStatusResponse> {
  const initialInterval = options.initialIntervalMs ?? 2000;
  const maxInterval = options.maxIntervalMs ?? 8000;
  const backoff = options.backoffFactor ?? 1.3;
  const timeout = options.timeoutMs ?? 5 * 60 * 1000;
  const start = Date.now();

  let interval = initialInterval;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException("poll aborted", "AbortError");
    }
    const status = await client.getLiveStatus(jobId);
    options.onTick?.(status);
    if (TERMINAL_STATUSES.has(status.overall_status)) {
      return status;
    }
    if (Date.now() - start > timeout) {
      throw new Error(
        `pollWorkflow: timed out after ${Math.round((Date.now() - start) / 1000)}s ` +
          `(job_id=${jobId}, last_status=${status.overall_status})`,
      );
    }
    await sleep(interval, options.signal);
    interval = Math.min(Math.round(interval * backoff), maxInterval);
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
