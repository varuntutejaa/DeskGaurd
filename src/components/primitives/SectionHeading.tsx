import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerChildren(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <motion.span
          variants={fadeUp}
          className="text-sm font-semibold uppercase tracking-[0.14em] text-primary"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        className="mt-3 font-display text-3xl font-semibold tracking-tightest text-balance sm:text-[2.5rem] sm:leading-[1.1]"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
