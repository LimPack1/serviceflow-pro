import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",
        outline: "text-foreground border-border",
        // Priority variants
        "priority-critical": "border-transparent bg-priority-critical text-primary-foreground",
        "priority-high": "border-transparent bg-priority-high text-primary-foreground",
        "priority-medium": "border-transparent bg-priority-medium text-warning-foreground",
        "priority-low": "border-transparent bg-priority-low text-success-foreground",
        // Status variants
        "status-new": "border-transparent bg-status-new/20 text-status-new",
        "status-open": "border-transparent bg-status-open/20 text-status-open",
        "status-pending": "border-transparent bg-status-pending/20 text-status-pending",
        "status-resolved": "border-transparent bg-status-resolved/20 text-status-resolved",
        "status-closed": "border-transparent bg-status-closed/20 text-status-closed",
        // Type variants
        incident: "border-transparent bg-destructive/20 text-destructive",
        request: "border-transparent bg-primary/20 text-primary",
        problem: "border-transparent bg-warning/20 text-warning",
        change: "border-transparent bg-info/20 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
