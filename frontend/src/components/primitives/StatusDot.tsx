import { cn } from "@/lib/utils";
import type { SeatStatus } from "@/features/seats/types";

const COLOR: Record<SeatStatus, string> = {
  available: "bg-status-available",
  occupied: "bg-status-occupied",
  away: "bg-status-away",
  abandoned: "bg-status-abandoned",
  maintenance: "bg-status-maintenance",
};

interface StatusDotProps {
  status: SeatStatus;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ status, pulse = false, className }: StatusDotProps) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulse-ring",
            COLOR[status]
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-white/70",
          COLOR[status]
        )}
      />
    </span>
  );
}
