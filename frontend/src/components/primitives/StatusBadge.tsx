import { cn } from "@/lib/utils";
import { STATUS_META, type SeatStatus } from "@/features/seats/types";
import { StatusDot } from "./StatusDot";

const TINT: Record<SeatStatus, string> = {
  available: "bg-status-available/10 text-status-available",
  occupied: "bg-status-occupied/10 text-status-occupied",
  away: "bg-status-away/10 text-[hsl(38_80%_38%)]",
  abandoned: "bg-status-abandoned/12 text-status-abandoned",
  maintenance: "bg-status-maintenance/10 text-status-maintenance",
};

export function StatusBadge({
  status,
  className,
}: {
  status: SeatStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TINT[status],
        className
      )}
    >
      <StatusDot status={status} />
      {STATUS_META[status].label}
    </span>
  );
}
