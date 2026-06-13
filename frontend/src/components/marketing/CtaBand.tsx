import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function CtaBand() {
  return (
    <section className="px-6 pb-24 sm:pb-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16 sm:py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:36px_36px] opacity-[0.12]" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tightest text-primary-foreground text-balance sm:text-[2.6rem] sm:leading-[1.1]">
            Give every student a fair seat
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-primary-foreground/70 text-balance">
            See DeskGuard running on a real library floor — live, interactive,
            and ready to deploy across your campus.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="border-transparent bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link to="/library">
                View Live Library
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/10"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
