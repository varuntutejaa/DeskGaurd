import { useLibrary, countByStatus } from "@/features/seats/store";
import { STATUS_META, STATUS_ORDER } from "@/features/seats/types";
import { AnimatedCounter } from "@/components/primitives/AnimatedCounter";


export function TopStatusBar() {
  const seats = useLibrary((s) => s.seats);
  const counts = countByStatus(seats);

  const inUse = counts.occupied + counts.away + counts.abandoned;
  const occupancy = counts.total ? (inUse / counts.total) * 100 : 0;

  return (
    <div className="flex items-stretch gap-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const color = `hsl(var(--st-${status}))`;
        return (
          <div
            key={status}
            className="group flex min-w-[8rem] flex-1 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-xs transition-shadow hover:shadow-sm"
          >
            {/* colour swatch bar */}
            <span
              className="h-9 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {meta.label}
              </p>
              <p
                className="font-display text-[26px] font-bold leading-none tabular-nums"
                style={{ color }}
              >
                <AnimatedCounter value={counts[status]} fromZero={false} />
              </p>
            </div>
          </div>
        );
      })}

      {/* occupancy ring card */}
      <div className="flex min-w-[10.5rem] flex-1 items-center gap-3.5 rounded-xl border border-primary/20 bg-primary-soft/50 px-4 py-3 shadow-xs">
        <OccupancyRing value={occupancy} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
            Occupancy
          </p>
          <p className="font-display text-[26px] font-bold leading-none tabular-nums text-primary">
            <AnimatedCounter value={occupancy} decimals={0} suffix="%" fromZero={false} />
          </p>
          <p className="mt-0.5 text-[10.5px] text-primary/60">
            {inUse} / {counts.total} seats
          </p>
        </div>
      </div>
    </div>
  );
}

function OccupancyRing({ value }: { value: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, value) / 100) * circ;
  return (
    <svg width={46} height={46} viewBox="0 0 46 46" className="shrink-0 -rotate-90">
      <circle cx="23" cy="23" r={r} fill="none"
        stroke="hsl(var(--primary) / 0.14)" strokeWidth="5.5" />
      <circle cx="23" cy="23" r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth="5.5" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.65s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}
