import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useTransform,
  animate,
  useInView,
  motion,
} from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  /** decimal places */
  decimals?: number;
  suffix?: string;
  className?: string;
  /** animate from 0 the first time it enters the viewport */
  fromZero?: boolean;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  className,
  fromZero = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(fromZero ? 0 : value);
  const rounded = useTransform(mv, (v) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
  const started = useRef(false);

  useEffect(() => {
    if (fromZero && !started.current) {
      if (!inView) return;
      started.current = true;
    }
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, inView, mv, fromZero]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
