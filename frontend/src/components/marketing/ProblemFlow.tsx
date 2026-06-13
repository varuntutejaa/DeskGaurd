import { motion } from "framer-motion";
import { Backpack, Ban, Clock, ArrowRight, QrCode, ScanLine, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PROBLEM_STEPS = [
  { icon: Backpack, title: "Student leaves a bag", desc: "Steps out for an hour, marking the seat as ‘taken’." },
  { icon: Clock, title: "Seat appears occupied", desc: "The desk sits empty but looks claimed to everyone else." },
  { icon: Ban, title: "Others can't study", desc: "Real students are turned away during peak exam season." },
];

const SOLUTION_STEPS = [
  { icon: QrCode, title: "Scan to check in", desc: "A quick QR scan binds the student to the seat in seconds." },
  { icon: ScanLine, title: "Away timer kicks in", desc: "Step out and an away countdown starts automatically." },
  { icon: CheckCircle2, title: "Seat auto-releases", desc: "If the timer lapses, the seat frees up for the next student." },
];

export function ProblemFlow() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeading
          eyebrow="The Problem"
          title="A few bags shouldn't lock out a whole library"
          description="Seat hoarding wastes the most valuable resource on campus during the hours students need it most."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <FlowCard
            label="Today"
            tone="problem"
            steps={PROBLEM_STEPS}
          />
          <FlowCard
            label="With DeskGuard"
            tone="solution"
            steps={SOLUTION_STEPS}
          />
        </div>
      </div>
    </section>
  );
}

function FlowCard({
  label,
  tone,
  steps,
}: {
  label: string;
  tone: "problem" | "solution";
  steps: { icon: React.ElementType; title: string; desc: string }[];
}) {
  const isSolution = tone === "solution";
  return (
    <motion.div
      variants={staggerChildren(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(
        "rounded-2xl border p-6 sm:p-8",
        isSolution
          ? "border-primary/20 bg-primary-soft/50 shadow-card"
          : "border-border bg-surface/60"
      )}
    >
      <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2.5">
        <span
          className={cn(
            "inline-flex h-2.5 w-2.5 rounded-full",
            isSolution ? "bg-status-available" : "bg-status-occupied"
          )}
        />
        <span
          className={cn(
            "text-sm font-semibold tracking-tight",
            isSolution ? "text-primary" : "text-status-occupied"
          )}
        >
          {label}
        </span>
      </motion.div>

      <div className="space-y-1">
        {steps.map((s, i) => (
          <motion.div key={s.title} variants={fadeUp}>
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
                  isSolution
                    ? "border-primary/15 bg-surface text-primary"
                    : "border-border bg-surface text-muted-foreground"
                )}
              >
                <s.icon className="size-5" />
              </span>
              <div className="pt-0.5">
                <p className="font-medium tracking-tight">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="ml-[1.4rem] flex h-7 items-center">
                <ArrowRight
                  className={cn(
                    "size-4 rotate-90",
                    isSolution ? "text-primary/40" : "text-border"
                  )}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
