import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-primary shadow-xs">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2.5l7 2.6v6.1c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.1l7-2.6z"
            fill="hsl(150 30% 98%)"
            fillOpacity="0.15"
            stroke="hsl(150 30% 98%)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M8.4 12.2l2.5 2.5 4.7-4.9"
            stroke="hsl(150 30% 98%)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
          Desk<span className="text-primary">Guard</span>
        </span>
      )}
    </span>
  );
}
