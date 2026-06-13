import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/primitives/AnimatedCounter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** css color (hsl token) for the accent */
  accent?: string;
  suffix?: string;
  hint?: string;
  index?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "hsl(var(--primary))",
  suffix,
  hint,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-xs"
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, white)`, color: accent }}
        >
          <Icon className="size-5" />
        </span>
        <span
          className="h-7 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </div>
      <p className="mt-4 text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">
        <AnimatedCounter value={value} fromZero={false} suffix={suffix} />
      </p>
      {hint && <p className={cn("mt-1 text-[12px] text-muted-foreground")}>{hint}</p>}
    </motion.div>
  );
}
