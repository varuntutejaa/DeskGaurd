import { motion } from "framer-motion";
import type { IssueRow } from "@/lib/api";

const TYPE_LABEL: Record<string, string> = {
  BROKEN_OUTLET: "Outlet",
  BROKEN_CHAIR: "Chair",
  NOISE: "Noise",
  CLEANLINESS: "Cleanliness",
  OTHER: "Other",
};

const COLORS = [
  "hsl(var(--st-maintenance))",
  "hsl(var(--st-away))",
  "hsl(var(--primary))",
  "hsl(var(--st-occupied))",
  "hsl(var(--st-abandoned))",
];

export function IssueReportsChart({ issues }: { issues: IssueRow[] }) {
  const counts = new Map<string, number>();
  for (const i of issues) counts.set(i.issueType, (counts.get(i.issueType) ?? 0) + 1);
  const bars = [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  if (!bars.length) {
    return (
      <div className="grid h-[160px] place-items-center text-center">
        <div>
          <p className="text-sm font-medium">No open issues 🎉</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Every reported issue has been resolved.
          </p>
        </div>
      </div>
    );
  }

  const max = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="flex h-[180px] items-end justify-around gap-3 px-2">
      {bars.map((b, i) => (
        <div key={b.type} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="font-mono text-sm font-semibold tabular-nums">{b.count}</span>
          <motion.div
            className="w-full max-w-[52px] rounded-t-lg"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
            initial={{ height: 0 }}
            animate={{ height: `${(b.count / max) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
          />
          <span className="text-[11px] font-medium text-muted-foreground">
            {TYPE_LABEL[b.type] ?? b.type}
          </span>
        </div>
      ))}
    </div>
  );
}
