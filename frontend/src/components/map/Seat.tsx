import { memo } from "react";
import { motion } from "framer-motion";
import { SEAT_TYPE_LABEL, ZONE_LABEL, type Seat as SeatT } from "@/features/seats/types";

/* ─────────────────────────────────────────────────────────────────────────────
   Status colour tokens
───────────────────────────────────────────────────────────────────────────── */
const STATUS_COLOR: Record<SeatT["status"], string> = {
  available:   "hsl(var(--st-available))",
  occupied:    "hsl(var(--st-occupied))",
  away:        "hsl(var(--st-away))",
  abandoned:   "hsl(var(--st-abandoned))",
  maintenance: "hsl(var(--st-maintenance))",
};

const STATUS_FILL_OPACITY: Record<SeatT["status"], number> = {
  available:   0.22,
  occupied:    0.30,
  away:        0.28,
  abandoned:   0.20,
  maintenance: 0.26,
};

const STATUS_STROKE_OPACITY: Record<SeatT["status"], number> = {
  available:   1,
  occupied:    1,
  away:        1,
  abandoned:   0.8,
  maintenance: 0.9,
};

/* ─────────────────────────────────────────────────────────────────────────────
   Geometry constants — 25-30% larger than original

   Desk:  width 36px  (was 28px,  +28%)   height 19px  (was 15px,  +27%)
   Chair: width 28px  (was 22px,  +27%)   height 18px  (was 13px,  +38%)
   Total seat card: 36 × 41px             (was 28 × 32px)
───────────────────────────────────────────────────────────────────────────── */
const DW      = 18;    // half-desk width  → full 36px
const D_TOP   = -24;   // desk top y
const D_BOT   = -5;    // desk bottom y   → desk height 19px
const CW      = 14;    // half-chair width → full 28px
const C_TOP   = -1;    // chair top y
const C_BOT   = 17;    // chair bottom y  → chair height 18px
const PART_W  = 3.5;   // cubicle partition thickness

/* Discussion chair radius */
const DISC_R  = 12;    // was 10 (+20%) — compact to fit inside room

/* Selection ring padding */
const SEL_PAD = 7;

export interface SeatHover {
  seat: SeatT;
  el: SVGGElement;
}

interface SeatProps {
  seat:     SeatT;
  selected: boolean;
  mine:     boolean;
  dimmed:   boolean;
  onSelect: (id: string) => void;
  onHover:  (hover: SeatHover | null) => void;
}

function SeatBase({ seat, selected, mine, dimmed, onSelect, onHover }: SeatProps) {
  const { x, y, type, status, id } = seat;
  const color       = STATUS_COLOR[status];
  const fillOpacity = STATUS_FILL_OPACITY[status];
  const strokeOpacity = STATUS_STROKE_OPACITY[status];
  const primary     = "hsl(var(--primary))";
  const isCubicle   = type === "cubicle";
  const isDiscussion = type === "discussion";
  const seated      = status === "occupied" || status === "away" || status === "abandoned";
  const highlightColor = mine ? primary : color;

  const ringX = isDiscussion ? -DISC_R - SEL_PAD : -DW - SEL_PAD;
  const ringY = isDiscussion ? -DISC_R - SEL_PAD : D_TOP - SEL_PAD;
  const ringW = isDiscussion ? (DISC_R + SEL_PAD) * 2 : (DW + SEL_PAD) * 2;
  const ringH = isDiscussion ? (DISC_R + SEL_PAD) * 2 : (C_BOT - D_TOP) + SEL_PAD * 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.g
        role="button"
        tabIndex={dimmed ? -1 : 0}
        aria-label={`Seat ${id}, ${SEAT_TYPE_LABEL[type]}, ${ZONE_LABEL[seat.zone]}, ${status}`}
        className="cursor-pointer outline-none"
        initial={false}
        animate={{ opacity: dimmed ? 0.12 : 1 }}
        transition={{ duration: 0.22 }}
        whileHover={{ scale: dimmed ? 1 : 1.13 }}
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
        {/* ── Selection / mine ring ── */}
        {(selected || mine) && (
          <g>
            <rect
              x={ringX + 2} y={ringY + 2}
              width={ringW - 4} height={ringH - 4}
              rx={11} fill={highlightColor} fillOpacity={0.12}
            />
            <motion.rect
              x={ringX} y={ringY}
              width={ringW} height={ringH}
              rx={12} fill="none"
              stroke={highlightColor} strokeWidth={2.25}
              strokeDasharray={mine ? undefined : "5 3"}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.8, 0.28, 0.8] }}
              transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        )}

        {/* ── DISCUSSION chair ── */}
        {isDiscussion ? (
          <>
            {/* white backing for contrast against glass */}
            <circle cx={0} cy={0} r={DISC_R + 3} fill="#FFFFFF" fillOpacity={0.75} />
            {/* chair body */}
            <motion.circle
              cx={0} cy={0} r={DISC_R}
              animate={{ fill: color, stroke: color }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              fillOpacity={selected || mine ? 0.55 : fillOpacity + 0.15}
              strokeWidth={2.25}
              strokeOpacity={strokeOpacity}
            />
            {/* presence dot */}
            {seated && (
              <motion.circle cx={0} cy={0} r={4.5}
                animate={{ fill: color }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              />
            )}
            {/* seat ID */}
            <text x={0} y={1.5} textAnchor="middle"
              fontSize={6.5} fontWeight={800} fill={color} fillOpacity={1}
              letterSpacing={0.3}
              style={{ userSelect: "none", pointerEvents: "none", fontVariantNumeric: "tabular-nums" }}>
              {id}
            </text>
          </>
        ) : (
          <>
            {/* ── Cubicle partitions ── */}
            {isCubicle && (
              <g>
                <rect x={-DW} y={D_TOP} width={DW * 2} height={PART_W}
                  rx={1.5} fill="#B0C4BA" />
                <rect x={-DW} y={D_TOP} width={PART_W} height={C_BOT - D_TOP}
                  rx={1.5} fill="#B0C4BA" />
                <rect x={DW - PART_W} y={D_TOP} width={PART_W} height={C_BOT - D_TOP}
                  rx={1.5} fill="#B0C4BA" />
              </g>
            )}

            {/* ── Desk surface shadow ── */}
            <rect
              x={isCubicle ? -DW + PART_W + 1 : -DW + 1}
              y={(D_TOP + (isCubicle ? PART_W : 0)) + 2}
              width={isCubicle ? (DW - PART_W) * 2 : DW * 2}
              height={D_BOT - D_TOP - (isCubicle ? PART_W : 0)}
              rx={isCubicle ? 3 : 5}
              fill="rgba(0,0,0,0.08)"
            />

            {/* ── Desk surface ── */}
            <motion.rect
              x={isCubicle ? -DW + PART_W : -DW}
              y={D_TOP + (isCubicle ? PART_W : 0)}
              width={isCubicle ? (DW - PART_W) * 2 : DW * 2}
              height={D_BOT - D_TOP - (isCubicle ? PART_W : 0)}
              rx={isCubicle ? 3 : 5}
              animate={{ fill: color, stroke: color }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              fillOpacity={selected || mine ? fillOpacity + 0.10 : fillOpacity}
              strokeWidth={isCubicle ? 1.25 : 2}
              strokeOpacity={isCubicle ? 0.55 : strokeOpacity}
            />

            {/* ── Desk top highlight ── */}
            <rect
              x={isCubicle ? -DW + PART_W + 3 : -DW + 3}
              y={D_TOP + (isCubicle ? PART_W : 0) + 1.5}
              width={isCubicle ? (DW - PART_W) * 2 - 6 : DW * 2 - 6}
              height={2.5}
              rx={1.25}
              fill="rgba(255,255,255,0.50)"
            />

            {/* ── Presence indicator ── */}
            {seated && (
              <motion.circle
                cx={-DW + 7} cy={D_TOP + 6}
                r={3.2}
                animate={{ fill: color }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              />
            )}

            {/* ── Seat ID on desk ── */}
            <text
              x={seated ? 2 : 0}
              y={(D_TOP + D_BOT) / 2 + 4}
              textAnchor="middle"
              fontSize={7} fontWeight={700}
              fill={color} fillOpacity={0.92}
              letterSpacing={0.3}
              style={{ userSelect: "none", pointerEvents: "none", fontVariantNumeric: "tabular-nums" }}>
              {id}
            </text>

            {/* ── Chair shadow ── */}
            <rect
              x={-CW + 2} y={C_TOP + 2.5}
              width={CW * 2} height={C_BOT - C_TOP}
              rx={5} fill="rgba(0,0,0,0.14)"
            />

            {/* ── Chair body ── */}
            <motion.rect
              x={-CW} y={C_TOP}
              width={CW * 2} height={C_BOT - C_TOP}
              rx={5}
              fill="#F5F9F6" fillOpacity={0.97}
              animate={{ stroke: color }}
              strokeWidth={1.8}
              strokeOpacity={strokeOpacity * 0.85}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            />

            {/* ── Chair highlight ── */}
            <rect
              x={-CW + 3} y={C_TOP + 2}
              width={CW * 2 - 6} height={3.5}
              rx={1.75} fill="#FFFFFF" fillOpacity={0.70}
            />

            {/* ── Charging port ── */}
            {seat.hasCharging && (
              <path
                d="M 1.5 -2.6 l -2.5 4 h 2 l -1.5 3"
                transform={`translate(${DW + 4}, ${D_TOP})`}
                fill="none" stroke={primary}
                strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.75}
              />
            )}
          </>
        )}
      </motion.g>
    </g>
  );
}

export const Seat = memo(SeatBase);
