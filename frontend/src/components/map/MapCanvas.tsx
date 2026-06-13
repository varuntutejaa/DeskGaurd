import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FLOOR } from "@/features/seats/geometry";
import {
  STATUS_META,
  STATUS_ORDER,
  type Seat as SeatT,
} from "@/features/seats/types";
import { useLibrary, filterSeats } from "@/features/seats/store";
import { FloorPlan } from "./FloorPlan";
import { Seat, type SeatHover } from "./Seat";
import { SeatPopover, type PopoverAnchor } from "./SeatPopover";

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ seat: SeatT; anchor: PopoverAnchor } | null>(null);

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
    const cRect  = containerRef.current.getBoundingClientRect();
    const sRect  = h.el.getBoundingClientRect();
    const x      = sRect.left + sRect.width / 2 - cRect.left;
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
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-[#DFE8E2] shadow-xs"
    >
      <svg
        viewBox={`0 128 ${FLOOR.width} 772`}
        className="h-full w-full select-none"
        preserveAspectRatio="xMidYMid meet"
        role="application"
        aria-label="Library floor plan"
      >
        <FloorPlan />
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
