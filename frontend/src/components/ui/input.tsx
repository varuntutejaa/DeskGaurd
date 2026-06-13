import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground shadow-xs outline-none transition-colors",
          "placeholder:text-muted-foreground/70",
          "hover:border-primary/30 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-status-occupied/60 aria-[invalid=true]:focus-visible:ring-status-occupied/30",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
