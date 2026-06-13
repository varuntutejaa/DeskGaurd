import { motion } from "framer-motion";
import type { ZoneUtil } from "@/lib/api";
import { ZONE_LABEL, type ZoneId } from "@/features/seats/types";

function barColor(pct: number) {
  if (pct >= 90) return "hsl(var(--st-occupied))";
  if (pct >= 70) return "hsl(var(--st-away))";
  return "hsl(var(--primary))";
}

export function ZoneUtilizationChart({ data }: { data: ZoneUtil[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No zone data yet.</p>;
  }
  return (
    <div className="space-y-3.5">
      {data.map((z, i) => {
        const label = ZONE_LABEL[z.zone as ZoneId] ?? z.zone;
        const color = barColor(z.occupancyPct);
        return (
          <div key={z.zone}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="font-medium text-foreground">{label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {z.inUse}/{z.total} · {z.occupancyPct}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${z.occupancyPct}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
