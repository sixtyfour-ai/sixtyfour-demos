/**
 * Error class for non-2xx responses from api.sixtyfour.ai.
 *
 * Surfaces the HTTP status, an optional Sixtyfour error code, and the
 * raw message so callers can decide whether to retry, fail-soft, or
 * surface to the user.
 */
export class SixtyfourApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "SixtyfourApiError";
  }
}
