import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 bg-radial-emerald" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:44px_44px] opacity-50 [mask-image:radial-gradient(60%_50%_at_50%_40%,black,transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md text-center"
      >
        <Link to="/" className="inline-flex">
          <Logo />
        </Link>
        <div className="mt-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary-soft text-primary">
          <Construction className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tightest">
          {title}
        </h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <Button variant="secondary" className="mt-8" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
