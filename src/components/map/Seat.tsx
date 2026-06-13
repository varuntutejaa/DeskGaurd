import { memo } from "react";
import { motion } from "framer-motion";
import { SEAT_TYPE_LABEL, ZONE_LABEL, type Seat as SeatT } from "@/features/seats/types";

/* -------------------------------------------------------------------------
   Status colour tokens
   ------------------------------------------------------------------------- */
const STATUS_COLOR: Record<SeatT["status"], string> = {
  available:   "hsl(var(--st-available))",
  occupied:    "hsl(var(--st-occupied))",
  away:        "hsl(var(--st-away))",
  abandoned:   "hsl(var(--st-abandoned))",
  maintenance: "hsl(var(--st-maintenance))",
};

/* -------------------------------------------------------------------------
   Geometry constants (all in SVG units, relative to seat centre)

   Layout (top→bottom):
     Desk surface  : y ∈ [-20, -5]  width 28 px
     Chair seat    : y ∈ [ -1, +12] width 22 px
   ─────────────────────────────────────────────────────────────────────── */
const DW      = 14;   // half desk width
const D_TOP   = -20;  // desk top y
const D_BOT   = -5;   // desk bottom y
const CW      = 11;   // half chair width
const C_TOP   = -1;   // chair seat top y
const C_BOT   = 12;   // chair seat bottom y
const PART_W  = 2.5;  // cubicle partition thickness

/* Discussion chair radius */
const DISC_R  = 10;

/* Selection / mine ring padding */
const SEL_PAD = 7;

export interface SeatHover {
  seat: SeatT;
  el: SVGGElement;
}

interface SeatProps {
  seat: SeatT;
  selected: boolean;
  mine: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  onHover: (hover: SeatHover | null) => void;
}

function SeatBase({ seat, selected, mine, dimmed, onSelect, onHover }: SeatProps) {
  const { x, y, type, status, id } = seat;
  const color  = STATUS_COLOR[status];
  const primary = "hsl(var(--primary))";
  const isCubicle = type === "cubicle";
  const isDiscussion = type === "discussion";
  const seated = status === "occupied" || status === "away" || status === "abandoned";
  const highlightColor = mine ? primary : color;

  // Ring bounding box
  const ringX  = isDiscussion ? -DISC_R - SEL_PAD : -DW - SEL_PAD;
  const ringY  = isDiscussion ? -DISC_R - SEL_PAD : D_TOP - SEL_PAD;
  const ringW  = isDiscussion ? (DISC_R + SEL_PAD) * 2 : (DW + SEL_PAD) * 2;
  const ringH  = isDiscussion ? (DISC_R + SEL_PAD) * 2 : (C_BOT - D_TOP) + SEL_PAD * 2;

  return (
    /* Outer group: pure SVG translate — no scale interference */
    <g transform={`translate(${x}, ${y})`}>
      <motion.g
        role="button"
        tabIndex={dimmed ? -1 : 0}
        aria-label={`Seat ${id}, ${SEAT_TYPE_LABEL[type]}, ${ZONE_LABEL[seat.zone]}, ${status}`}
        className="cursor-pointer outline-none"
        initial={false}
        animate={{ opacity: dimmed ? 0.14 : 1 }}
        transition={{ duration: 0.25 }}
        whileHover={{ scale: dimmed ? 1 : 1.14 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        onMouseEnter={(e) => !dimmed && onHover({ seat, el: e.currentTarget })}
        onMouseLeave={() => onHover(null)}
        onFocus={(e) => !dimmed && onHover({ seat, el: e.currentTarget })}
        onBlur={() => onHover(null)}
        onClick={() => !dimmed && onSelect(id)}
        onKeyDown={(e) => {
          if (dimmed) return;
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id); }
        }}
      >
        {/* ── selection / mine glow + ring ─────────────────────────── */}
        {(selected || mine) && (
          <g>
            {/* soft glow fill */}
            <rect
              x={ringX + 2}
              y={ringY + 2}
              width={ringW - 4}
              height={ringH - 4}
              rx={10}
              fill={highlightColor}
              fillOpacity={0.1}
            />
            {/* animated ring */}
            <motion.rect
              x={ringX}
              y={ringY}
              width={ringW}
              height={ringH}
              rx={11}
              fill="none"
              stroke={highlightColor}
              strokeWidth={2}
              strokeDasharray={mine ? undefined : "5 3"}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.75, 0.28, 0.75] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        )}

        {/* ── DISCUSSION CHAIR ──────────────────────────────────────── */}
        {isDiscussion ? (
          <>
            {/* white backing ring for visibility against glass */}
            <circle cx={0} cy={0} r={DISC_R + 2} fill="#ffffff" fillOpacity={0.7} />
            {/* circular chair seat */}
            <motion.circle
              cx={0}
              cy={0}
              r={DISC_R}
              animate={{ fill: color, stroke: color }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              fillOpacity={selected || mine ? 0.55 : 0.4}
              strokeWidth={2}
              strokeOpacity={1}
            />
            {/* presence indicator */}
            {seated && (
              <motion.circle
                cx={0}
                cy={0}
                r={4}
                animate={{ fill: color }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
              />
            )}
            {/* seat ID */}
            <text
              x={0}
              y={1.2}
              textAnchor="middle"
              fontSize={6}
              fontWeight={800}
              fill={color}
              fillOpacity={1}
              letterSpacing={0.3}
              style={{ userSelect: "none", pointerEvents: "none", fontVariantNumeric: "tabular-nums" }}
            >
              {id}
            </text>
          </>
        ) : (
          <>
            {/* ── cubicle partition walls ───────────────────────────── */}
            {isCubicle && (
              <g>
                {/* back wall */}
                <rect
                  x={-DW}
                  y={D_TOP}
                  width={DW * 2}
                  height={PART_W}
                  rx={1}
                  fill="#b4c8be"
                />
                {/* left partition */}
                <rect
                  x={-DW}
                  y={D_TOP}
                  width={PART_W}
                  height={C_BOT - D_TOP}
                  rx={1}
                  fill="#b4c8be"
                />
                {/* right partition */}
                <rect
                  x={DW - PART_W}
                  y={D_TOP}
                  width={PART_W}
                  height={C_BOT - D_TOP}
                  rx={1}
                  fill="#b4c8be"
                />
              </g>
            )}

            {/* ── desk surface ──────────────────────────────────────── */}
            <motion.rect
              x={isCubicle ? -DW + PART_W : -DW}
              y={D_TOP + (isCubicle ? PART_W : 0)}
              width={isCubicle ? (DW - PART_W) * 2 : DW * 2}
              height={D_BOT - D_TOP - (isCubicle ? PART_W : 0)}
              rx={isCubicle ? 2 : 3.5}
              animate={{ fill: color, stroke: color }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              fillOpacity={selected || mine ? 0.26 : 0.18}
              strokeWidth={isCubicle ? 1 : 1.8}
              strokeOpacity={isCubicle ? 0.5 : 1}
            />

            {/* ── presence indicator (occupied / away / abandoned) ──── */}
            {seated && (
              <motion.circle
                cx={-DW + 6}
                cy={D_TOP + 5.5}
                r={2.8}
                animate={{ fill: color }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
              />
            )}

            {/* ── seat ID on desk ───────────────────────────────────── */}
            <text
              x={seated ? 2 : 0}
              y={(D_TOP + D_BOT) / 2 + 3.5}
              textAnchor="middle"
              fontSize={6.5}
              fontWeight={700}
              fill={color}
              fillOpacity={0.88}
              letterSpacing={0.3}
              style={{ userSelect: "none", pointerEvents: "none", fontVariantNumeric: "tabular-nums" }}
            >
              {id}
            </text>

            {/* ── chair seat (3-layer: shadow → body → highlight) ─── */}
            {/* drop shadow */}
            <rect
              x={-CW + 1.5}
              y={C_TOP + 2}
              width={CW * 2}
              height={C_BOT - C_TOP}
              rx={4}
              fill="rgba(0,0,0,0.22)"
            />
            {/* chair body */}
            <motion.rect
              x={-CW}
              y={C_TOP}
              width={CW * 2}
              height={C_BOT - C_TOP}
              rx={4}
              fill="#f4f8f5"
              fillOpacity={0.96}
              animate={{ stroke: color }}
              strokeWidth={1.6}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            />
            {/* top highlight strip */}
            <rect
              x={-CW + 2.5}
              y={C_TOP + 1.5}
              width={CW * 2 - 5}
              height={3}
              rx={1.5}
              fill="#ffffff"
              fillOpacity={0.65}
            />

            {/* ── charging port bolt ────────────────────────────────── */}
            {seat.hasCharging && (
              <path
                d="M 1.4 -2.4 l -2.4 3.8 h 1.8 l -1.4 2.8"
                transform={`translate(${DW + 3.5}, ${D_TOP})`}
                fill="none"
                stroke={primary}
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            )}
          </>
        )}
      </motion.g>
    </g>
  );
}

export const Seat = memo(SeatBase);