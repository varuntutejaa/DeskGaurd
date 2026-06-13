import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { STATUS_META, STATUS_ORDER, type SeatStatus } from "@/features/seats/types";
import { Logo } from "@/components/brand/Logo";

// A compact, decorative live-occupancy preview for the hero.
// Seats flip states on an interval to convey "real-time".

const COLS = 8;
const ROWS = 5;
const TOTAL = COLS * ROWS;

const INITIAL: SeatStatus[] = Array.from({ length: TOTAL }, (_, i) => {
  if (i % 11 === 0) return "maintenance";
  if (i % 7 === 0) return "abandoned";
  if (i % 3 === 0) return "away";
  if (i % 2 === 0) return "occupied";
  return "available";
});

const FILL: Record<SeatStatus, string> = {
  available: "hsl(var(--st-available))",
  occupied: "hsl(var(--st-occupied))",
  away: "hsl(var(--st-away))",
  abandoned: "hsl(var(--st-abandoned))",
  maintenance: "hsl(var(--st-maintenance))",
};

export function MiniLibraryMap() {
  const [seats, setSeats] = useState<SeatStatus[]>(INITIAL);

  useEffect(() => {
    const id = setInterval(() => {
      setSeats((prev) => {
        const next = [...prev];
        const flips = 2 + Math.floor(Math.random() * 2);
        for (let k = 0; k < flips; k++) {
          const i = Math.floor(Math.random() * TOTAL);
          next[i] = STATUS_ORDER[Math.floor(Math.random() * STATUS_ORDER.length)];
        }
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: seats.filter((x) => x === s).length }),
    {} as Record<SeatStatus, number>
  );

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      {/* window chrome */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo showWordmark={false} />
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-tight">
              Main Library · Level 2
            </p>
            <p className="text-[11px] text-muted-foreground">Live occupancy</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-status-available/10 px-2.5 py-1 text-[11px] font-medium text-status-available">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-available" />
          </span>
          Live
        </span>
      </div>

      {/* seat grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {seats.map((status, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-[7px]"
            animate={{ backgroundColor: FILL[status] }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            style={{ opacity: 0.92 }}
          />
        ))}
      </div>

      {/* legend / counts */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-4">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: FILL[s] }}
            />
            <span className="text-[11px] text-muted-foreground">
              {STATUS_META[s].label}
            </span>
            <span className="font-mono text-[11px] font-medium text-foreground tabular-nums">
              {counts[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
