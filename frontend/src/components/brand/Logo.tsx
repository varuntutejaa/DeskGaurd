import { cn } from "@/lib/utils";

export function Logo({
  className,
}: {
  className?: string;
}) {
  return (
    <span className={cn("font-display text-[17px] font-semibold tracking-tight text-foreground", className)}>
      Desk<span className="text-primary">Guard</span>
    </span>
  );
}
