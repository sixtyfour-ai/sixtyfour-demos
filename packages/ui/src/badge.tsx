import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-zinc-800 bg-zinc-900 text-zinc-300",
        accent: "border-blue-400/30 bg-blue-400/10 text-blue-300",
        muted: "border-zinc-800 bg-transparent text-zinc-500",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        warning: "border-blue-500/30 bg-blue-500/10 text-blue-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
