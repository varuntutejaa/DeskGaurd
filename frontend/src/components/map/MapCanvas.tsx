import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FLOOR } from "@/features/seats/geometry";
import {
  STATUS_META,
  STATUS_ORDER,
  ZONE_LABEL,
  type Seat as SeatT,
  type ZoneId,
} from "@/features/seats/types";
import { useLibrary, filterSeats } from "@/features/seats/store";
import { FloorPlan } from "./FloorPlan";
import { Seat, type SeatHover } from "./Seat";
import { SeatPopover, type PopoverAnchor } from "./SeatPopover";

/* ─────────────────────────────────────────────────────────────────────────────
   Zone configuration
───────────────────────────────────────────────────────────────────────────── */

/** Clickable zone rect definitions (SVG coords) */
const ZONE_AREAS: Array<{ zone: ZoneId; x: number; y: number; w: number; h: number }> = [
  { zone: "open-left",         x: 32,  y: 160, w: 494, h: 408 },
  { zone: "open-right",        x: 754, y: 160, w: 494, h: 408 },
  { zone: "cubicle-left",      x: 32,  y: 572, w: 400, h: 296 },
  { zone: "cubicle-right",     x: 848, y: 572, w: 400, h: 296 },
  { zone: "discussion-rooms",  x: 448, y: 578, w: 384, h: 282 },
];

/** ViewBox for each zone overlay (bounding box + 10px padding) */
const ZONE_VIEWS: Record<ZoneId, string> = {
  "open-left":         "22 150 514 428",
  "open-right":        "744 150 514 428",
  "cubicle-left":      "22 562 420 316",
  "cubicle-right":     "838 562 420 316",
  "discussion-rooms":  "438 568 404 302",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Zone overlay — pops up when user clicks a zone background
───────────────────────────────────────────────────────────────────────────── */
function ZoneOverlay({
  zone,
  onClose,
}: {
  zone: ZoneId;
  onClose: () => void;
}) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ seat: SeatT; anchor: PopoverAnchor } | null>(null);

  const seats     = useLibrary((s) => s.seats);
  const mySeatId  = useLibrary((s) => s.mySeatId);
  const selectedId = useLibrary((s) => s.selectedId);
  const select    = useLibrary((s) => s.select);

  const zoneSeats = seats.filter((s) => s.zone === zone);

  const handleSeatSelect = (seatId: string) => {
    select(seatId);
    onClose();
  };

  const onSeatHover = useCallback((h: SeatHover | null) => {
    if (!h || !svgContainerRef.current) { setHover(null); return; }
    const cRect   = svgContainerRef.current.getBoundingClientRect();
    const sRect   = h.el.getBoundingClientRect();
    const x       = sRect.left + sRect.width / 2 - cRect.left;
    const seatTop = sRect.top - cRect.top;
    const above   = seatTop > 120;
    setHover({
      seat: h.seat,
      anchor: { x, y: above ? seatTop - 8 : seatTop + sRect.height + 8, above },
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative m-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-[#D8E4DE] shadow-2xl"
        style={{ height: "min(78vh, 580px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-surface/70 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Zone View</p>
            <h3 className="text-sm font-semibold text-foreground">{ZONE_LABEL[zone]}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close zone view"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Zoomed SVG */}
        <div ref={svgContainerRef} className="relative flex-1 overflow-hidden">
          <svg
            viewBox={ZONE_VIEWS[zone]}
            className="h-full w-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <FloorPlan />
            {zoneSeats.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                selected={selectedId === seat.id}
                mine={mySeatId === seat.id}
                dimmed={false}
                onSelect={handleSeatSelect}
                onHover={onSeatHover}
              />
            ))}
          </svg>
          <AnimatePresence>
            {hover && <SeatPopover seat={hover.seat} anchor={hover.anchor} />}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <p className="shrink-0 border-t border-border/40 px-4 py-2 text-center text-[11px] text-muted-foreground">
          Click a seat to select it · Press <kbd className="rounded border border-border px-1 font-mono text-[10px]">Esc</kbd> or tap outside to close
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MapCanvas
───────────────────────────────────────────────────────────────────────────── */
export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover,       setHover]       = useState<{ seat: SeatT; anchor: PopoverAnchor } | null>(null);
  const [zoomedZone,  setZoomedZone]  = useState<ZoneId | null>(null);

  const seats      = useLibrary((s) => s.seats);
  const filters    = useLibrary((s) => s.filters);
  const selectedId = useLibrary((s) => s.selectedId);
  const mySeatId   = useLibrary((s) => s.mySeatId);
  const select     = useLibrary((s) => s.select);

  const visible    = filterSeats(seats, filters);
  const visibleIds = new Set(visible.map((s) => s.id));
  const filtersActive =
    filters.query  !== "" ||
    filters.status !== "all" ||
    filters.zone   !== "all" ||
    filters.type   !== "all";

  const onSeatHover = useCallback((h: SeatHover | null) => {
    if (!h || !containerRef.current) { setHover(null); return; }
    const cRect   = containerRef.current.getBoundingClientRect();
    const sRect   = h.el.getBoundingClientRect();
    const x       = sRect.left + sRect.width / 2 - cRect.left;
    const seatTop = sRect.top - cRect.top;
    const above   = seatTop > 150;
    setHover({
      seat: h.seat,
      anchor: { x, y: above ? seatTop - 8 : seatTop + sRect.height + 8, above },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-[#D8E4DE] shadow-xs"
    >
      <svg
        viewBox={`0 128 ${FLOOR.width} 772`}
        className="h-full w-full select-none"
        preserveAspectRatio="xMidYMid slice"
        role="application"
        aria-label="Library floor plan"
      >
        <FloorPlan />

        {/* Zone click areas — transparent, sit below seats so seats take priority */}
        {ZONE_AREAS.map(({ zone, x, y, w, h }) => (
          <rect
            key={zone}
            x={x} y={y} width={w} height={h}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => setZoomedZone(zone)}
          />
        ))}

        {seats.map((seat) => (
          <Seat
            key={seat.id}
            seat={seat}
            selected={selectedId === seat.id}
            mine={mySeatId === seat.id}
            dimmed={filtersActive && !visibleIds.has(seat.id)}
            onSelect={select}
            onHover={onSeatHover}
          />
        ))}
      </svg>

      {/* Hover popover */}
      <AnimatePresence>
        {hover && <SeatPopover seat={hover.seat} anchor={hover.anchor} />}
      </AnimatePresence>

      {/* Zone zoom overlay */}
      <AnimatePresence>
        {zoomedZone && (
          <ZoneOverlay
            zone={zoomedZone}
            onClose={() => setZoomedZone(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating legend — shown on small screens where SVG legend is tiny */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-border/60 bg-surface/90 px-3 py-2 shadow-xs backdrop-blur-sm">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `hsl(var(--st-${s}))` }}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {STATUS_META[s].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
