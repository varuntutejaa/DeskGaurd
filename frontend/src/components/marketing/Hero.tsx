import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiniLibraryMap } from "./MiniLibraryMap";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { useAuth } from "@/lib/auth";

export function Hero() {
  const user = useAuth();

  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-emerald" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint bg-[size:44px_44px] opacity-[0.5] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />

      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 lg:grid-cols-2">
        {/* left — text */}
        <motion.div variants={staggerChildren(0.1)} initial="hidden" animate="show">

          <motion.h1
            variants={fadeUp}
            className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tightest text-balance sm:text-6xl"
          >
            End Library Seat{" "}
            <span className="relative whitespace-nowrap text-primary">
              Hoarding
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="10"
                viewBox="0 0 200 10"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7c40-5 120-5 196 0"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </svg>
            </span>{" "}
            Forever
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-balance"
          >
            Real-time seat tracking, QR check-ins, automated abandonment
            detection, and smart library management — all in one place.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/library">
                    View Live Map
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                {user.role === "admin" && (
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/library">
                    View Live Map
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <a href="#how-it-works">How it works</a>
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* right — map */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />
          <MiniLibraryMap />
        </motion.div>
      </div>
    </section>
  );
}
