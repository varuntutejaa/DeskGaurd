import { motion } from "framer-motion";
import { ScanLine, MapPin, Timer, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    icon: ScanLine,
    step: "01",
    title: "Scan the seat QR",
    desc: "Find an open desk and scan its code. You're checked in instantly — no app download, no login friction.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Your seat goes live",
    desc: "The seat turns green-to-occupied on the live map. Your study session timer begins automatically.",
  },
  {
    icon: Timer,
    step: "03",
    title: "Tap ‘Away’ for breaks",
    desc: "Heading out for a bit? Activate Away mode to hold your seat with a visible countdown for everyone.",
  },
  {
    icon: RefreshCw,
    step: "04",
    title: "Seats free up fairly",
    desc: "If a hold lapses or a desk sits idle, DeskGuard releases it — keeping every seat in honest circulation.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="From walk-in to checked-in in seconds"
          description="A flow so simple students forget it's even there — until they notice they always find a seat."
        />

        <motion.ol
          variants={staggerChildren(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          {/* vertical spine */}
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-border to-transparent sm:left-1/2 sm:-translate-x-1/2" />

          {STEPS.map((s, i) => (
            <motion.li
              key={s.step}
              variants={fadeUp}
              className={`relative mb-10 flex gap-5 last:mb-0 sm:mb-14 sm:w-1/2 sm:gap-0 ${
                i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
              }`}
            >
              {/* node */}
              <span
                className={`absolute z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary/15 bg-surface text-primary shadow-card ${
                  i % 2 === 0
                    ? "left-0 sm:left-auto sm:-right-7"
                    : "left-0 sm:-left-7"
                }`}
              >
                <s.icon className="size-6" />
              </span>

              <div className={`pl-[4.5rem] sm:pl-0 ${i % 2 === 0 ? "" : ""}`}>
                <span className="font-mono text-xs font-medium tracking-widest text-primary/70">
                  STEP {s.step}
                </span>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
