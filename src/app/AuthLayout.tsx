import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, ScanLine, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { MiniLibraryMap } from "@/components/marketing/MiniLibraryMap";

const POINTS = [
  { icon: MapPin, text: "See every open seat in real time" },
  { icon: ScanLine, text: "Check in with a single QR scan" },
  { icon: ShieldCheck, text: "Fair seats — no more hoarding" },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:38px_38px] opacity-[0.12]" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative inline-flex w-fit shrink-0">
          <span className="rounded-xl bg-white/10 px-1 py-1 backdrop-blur">
            <Logo className="[&_span:last-child]:text-white" />
          </span>
        </Link>

        {/* Content — vertically centred in remaining height */}
        <div className="relative flex flex-1 flex-col justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md [filter:drop-shadow(0_24px_48px_rgb(0_0_0/0.25))]"
          >
            <MiniLibraryMap />
          </motion.div>

          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tightest text-balance xl:text-4xl">
              The smartest way to manage library seats.
            </h2>
            <ul className="mt-6 space-y-3">
              {POINTS.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-[15px] text-primary-foreground/80">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
                    <p.icon className="size-4" />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* form panel */}
      <main className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[400px]"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
