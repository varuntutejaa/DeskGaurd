import { motion } from "framer-motion";
import { Zap, ZapOff, Clock, MapPin } from "lucide-react";
import {
  SEAT_TYPE_LABEL,
  STATUS_META,
  ZONE_LABEL,
  type Seat,
} from "@/features/seats/types";
import { StatusDot } from "@/components/primitives/StatusDot";
import { formatDuration } from "@/lib/utils";

export interface PopoverAnchor {
  x: number; // px within map container
  y: number;
  above: boolean;
}

export function SeatPopover({
  seat,
  anchor,
}: {
  seat: Seat;
  anchor: PopoverAnchor;
}) {
  const meta = STATUS_META[seat.status];
  const showDuration =
    seat.status === "occupied" ||
    seat.status === "away" ||
    seat.status === "abandoned";

  return (
    <motion.div
      initial={{ opacity: 0, y: anchor.above ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute z-30 w-60"
      style={{
        left: anchor.x,
        top: anchor.y,
        transform: `translate(-50%, ${anchor.above ? "-100%" : "0"})`,
      }}
    >
      <div className="glass rounded-xl p-3.5 shadow-pop">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold tracking-tight">
            Seat {seat.id}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <StatusDot status={seat.status} pulse={seat.status === "occupied"} />
            {meta.label}
          </span>
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {SEAT_TYPE_LABEL[seat.type]}
        </p>

        <div className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-xs">
          <Row icon={MapPin} label={ZONE_LABEL[seat.zone]} />
          {showDuration && (
            <Row
              icon={Clock}
              label={
                seat.status === "away"
                  ? `Away · ${formatDuration(seat.awayRemaining)} left`
                  : `${formatDuration(seat.occupiedFor)} occupied`
              }
            />
          )}
          <Row
            icon={seat.hasCharging ? Zap : ZapOff}
            label={
              seat.hasCharging ? "Charging port available" : "No charging port"
            }
            highlight={seat.hasCharging}
          />
          {seat.amenity && seat.amenity !== "Near charging port" && (
            <Row icon={MapPin} label={seat.amenity} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Row({
  icon: Icon,
  label,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`size-3.5 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`}
      />
      <span className={highlight ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
