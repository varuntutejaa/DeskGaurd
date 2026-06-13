import { useLibrary, countByStatus } from "@/features/seats/store";
import { STATUS_META, STATUS_ORDER } from "@/features/seats/types";
import { AnimatedCounter } from "@/components/primitives/AnimatedCounter";

export function CompactStatusBar() {
  const seats  = useLibrary((s) => s.seats);
  const counts = countByStatus(seats);
  const inUse  = counts.occupied + counts.away + counts.abandoned;
  const pct    = counts.total ? Math.round((inUse / counts.total) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STATUS_ORDER.map((status) => {
        const meta  = STATUS_META[status];
        const color = `hsl(var(--st-${status}))`;
        return (
          <div
            key={status}
            className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/70 px-2.5 py-1 shadow-sm backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[11px] font-semibold text-foreground/70">{meta.label}</span>
            <span className="font-mono text-[13px] font-bold tabular-nums" style={{ color }}>
              <AnimatedCounter value={counts[status]} fromZero={false} />
            </span>
          </div>
        );
      })}

      {/* occupancy summary */}
      <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/8 px-2.5 py-1 shadow-sm backdrop-blur-md">
        <span className="text-[11px] font-semibold text-primary/70">Occupancy</span>
        <span className="font-mono text-[13px] font-bold tabular-nums text-primary">
          <AnimatedCounter value={pct} decimals={0} suffix="%" fromZero={false} />
        </span>
        <span className="text-[10px] text-primary/50">{inUse}/{counts.total}</span>
      </div>
    </div>
  );
}
