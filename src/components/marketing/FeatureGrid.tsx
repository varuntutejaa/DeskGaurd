import { motion } from "framer-motion";
import {
  Map,
  QrCode,
  Coffee,
  ShieldAlert,
  Flag,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  span?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Map,
    title: "Live Occupancy Map",
    desc: "A real-time floor plan of every seat, zone, and study room — updated the moment status changes.",
    span: true,
  },
  {
    icon: QrCode,
    title: "QR Check-In",
    desc: "Students claim a seat with a single scan. No accounts to fumble with.",
  },
  {
    icon: Coffee,
    title: "Away Mode",
    desc: "Step out for coffee with a protected hold — and a countdown everyone can see.",
  },
  {
    icon: ShieldAlert,
    title: "Anti-Hoarding Detection",
    desc: "Idle seats are automatically flagged and released so no desk sits empty for hours.",
  },
  {
    icon: Flag,
    title: "Issue Reporting",
    desc: "Report a broken outlet or abandoned bag in two taps, routed straight to staff.",
  },
  {
    icon: LayoutDashboard,
    title: "Librarian Dashboard",
    desc: "Occupancy trends, zone utilization, and live alerts in one premium control room.",
    span: true,
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything a modern library needs"
          description="Purpose-built tools that work together to keep seats fair, available, and effortless to manage."
        />

        <motion.div
          variants={staggerChildren(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.article
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow hover:shadow-card ${
                f.span ? "lg:col-span-2" : ""
              }`}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-soft opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                <f.icon className="size-[1.35rem]" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
