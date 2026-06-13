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
  const [hover, setHover] = useState<{ seat: SeatT; anchor: PopoverAnchor } | null>(
    null
  );

  const seats = useLibrary((s) => s.seats);
  const filters = useLibrary((s) => s.filters);
  const selectedId = useLibrary((s) => s.selectedId);
  const mySeatId = useLibrary((s) => s.mySeatId);
  const select = useLibrary((s) => s.select);

  const visible = filterSeats(seats, filters);
  const visibleIds = new Set(visible.map((s) => s.id));
  const filtersActive =
    filters.query !== "" ||
    filters.status !== "all" ||
    filters.zone !== "all" ||
    filters.type !== "all";

  const onSeatHover = useCallback((h: SeatHover | null) => {
    if (!h || !containerRef.current) {
      setHover(null);
      return;
    }
    const cRect = containerRef.current.getBoundingClientRect();
    const sRect = h.el.getBoundingClientRect();
    const x = sRect.left + sRect.width / 2 - cRect.left;
    const seatTop = sRect.top - cRect.top;
    const above = seatTop > 150;
    setHover({
      seat: h.seat,
      anchor: { x, y: above ? seatTop - 8 : seatTop + sRect.height + 8, above },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-[#eef3f0] shadow-xs"
    >
      <svg
        viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`}
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

      {/* hover popover */}
      <AnimatePresence>
        {hover && <SeatPopover seat={hover.seat} anchor={hover.anchor} />}
      </AnimatePresence>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden flex-wrap gap-x-4 gap-y-1.5 rounded-xl glass px-3.5 py-2.5 sm:flex">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: `hsl(var(--st-${s}))` }}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {STATUS_META[s].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
