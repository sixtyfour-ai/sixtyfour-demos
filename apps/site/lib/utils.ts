import { cn } from "@sixtyfour-demos/ui";

export { cn };

/** Format a percentage, defaulting to 0 if undefined. */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "0%";
  return `${Math.round(value)}%`;
}
