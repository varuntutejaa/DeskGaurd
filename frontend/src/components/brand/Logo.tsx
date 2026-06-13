import { cn } from "@/lib/utils";

/** Shield icon extracted from desk-guard-interface-logo.svg */
function ShieldIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="240 35 200 215"
      role="img"
      aria-label="DeskGuard icon"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="dg-shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Outer shield */}
      <path
        d="M340 50 L420 90 L420 160 Q420 200 340 230 Q260 200 260 160 L260 90 Z"
        fill="url(#dg-shield-grad)" stroke="#047857" strokeWidth="2" strokeLinejoin="round"
      />
      {/* Inner shield accent */}
      <path
        d="M340 65 L405 100 L405 160 Q405 190 340 215 Q275 190 275 160 L275 100 Z"
        fill="none" stroke="#d1fae5" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6"
      />
      {/* Monitor screen frame */}
      <rect x="305" y="105" width="70" height="55" rx="3" fill="none" stroke="white" strokeWidth="2" />
      {/* Screen fill */}
      <rect x="310" y="110" width="60" height="45" fill="#ecfdf5" opacity="0.9" />
      {/* Screen shine */}
      <line x1="325" y1="120" x2="355" y2="120" stroke="white" strokeWidth="1.5" opacity="0.7" />
      {/* Desk surface */}
      <line x1="310" y1="160" x2="370" y2="160" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Desk legs */}
      <line x1="315" y1="160" x2="318" y2="172" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="365" y1="160" x2="362" y2="172" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Checkmark badge */}
      <g transform="translate(360, 145)">
        <circle cx="0" cy="0" r="8" fill="white" opacity="0.3" />
        <path d="M-3 0 L2 4 L6 -2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = 32,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ShieldIcon size={size} />
      {showWordmark && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
          Desk<span className="text-primary">Guard</span>
        </span>
      )}
    </span>
  );
}
