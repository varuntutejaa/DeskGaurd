import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { TrendPoint } from "@/lib/api";

const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 34 };

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const fmtHour = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" }).toLowerCase().replace(" ", "");

export function OccupancyTrendChart({ data }: { data: TrendPoint[] }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <div ref={ref} className="grid h-[240px] place-items-center text-sm text-muted-foreground">
        Collecting occupancy data…
      </div>
    );
  }

  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = H - PAD.top - PAD.bottom;
  const maxY = 100;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / maxY) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.occupancyPct)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;

  const gridYs = [0, 25, 50, 75, 100];
  const labelStep = Math.ceil(data.length / 6);

  const hd = hover != null ? data[hover] : null;

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={width}
        height={H}
        className="overflow-visible"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = e.clientX - rect.left;
          const i = Math.round(((px - PAD.left) / innerW) * (data.length - 1));
          setHover(Math.min(data.length - 1, Math.max(0, i)));
        }}
      >
        <defs>
          <linearGradient id="occ-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y gridlines + labels */}
        {gridYs.map((g) => (
          <g key={g}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(g)}
              y2={y(g)}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeDasharray={g === 0 ? undefined : "3 4"}
              opacity={g === 0 ? 1 : 0.7}
            />
            <text x={PAD.left - 8} y={y(g) + 3} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">
              {g}%
            </text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) =>
          i % labelStep === 0 || i === data.length - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              {fmtHour(d.at)}
            </text>
          ) : null
        )}

        {/* area + line */}
        <motion.path
          d={areaPath}
          fill="url(#occ-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* hover guide */}
        {hd && (
          <g>
            <line
              x1={x(hover!)}
              x2={x(hover!)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              opacity={0.3}
            />
            <circle cx={x(hover!)} cy={y(hd.occupancyPct)} r={4.5} fill="hsl(var(--primary))" stroke="#fff" strokeWidth={2} />
          </g>
        )}

        {/* end marker */}
        <circle
          cx={x(data.length - 1)}
          cy={y(data[data.length - 1].occupancyPct)}
          r={3.5}
          fill="hsl(var(--primary))"
        />
      </svg>

      {/* tooltip */}
      {hd && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg glass px-2.5 py-1.5 text-center shadow-pop"
          style={{ left: x(hover!), top: 0 }}
        >
          <p className="font-display text-sm font-semibold leading-none text-primary">
            {hd.occupancyPct}%
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtHour(hd.at)}</p>
        </div>
      )}
    </div>
  );
}
