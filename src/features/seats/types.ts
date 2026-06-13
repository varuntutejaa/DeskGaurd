export type SeatStatus =
  | "available"
  | "occupied"
  | "away"
  | "abandoned"
  | "maintenance";

export type SeatType = "cubicle" | "open-desk" | "discussion";

export type ZoneId =
  | "open-left"
  | "open-right"
  | "cubicle-left"
  | "cubicle-right"
  | "discussion-rooms";

export const ZONE_LABEL: Record<ZoneId, string> = {
  "open-left": "Open Reading (Left)",
  "open-right": "Open Reading (Right)",
  "cubicle-left": "Cubicle Zone (Left)",
  "cubicle-right": "Cubicle Zone (Right)",
  "discussion-rooms": "Discussion Rooms",
};

export interface Seat {
  id: string;
  type: SeatType;
  status: SeatStatus;
  zone: ZoneId;
  hasCharging: boolean;
  amenity?: string;
  x: number;
  y: number;
  occupiedFor: number;
  awayRemaining: number;
}

export interface StatusMeta {
  label: string;
  color: string;
  hsl: string;
  description: string;
}

export const SEAT_TYPE_LABEL: Record<SeatType, string> = {
  cubicle: "Cubicle Seat",
  "open-desk": "Open Desk",
  discussion: "Discussion Chair",
};

export const STATUS_META: Record<SeatStatus, StatusMeta> = {
  available: {
    label: "Available",
    color: "status-available",
    hsl: "hsl(var(--st-available))",
    description: "Open and ready to use",
  },
  occupied: {
    label: "Occupied",
    color: "status-occupied",
    hsl: "hsl(var(--st-occupied))",
    description: "Actively in use",
  },
  away: {
    label: "Away",
    color: "status-away",
    hsl: "hsl(var(--st-away))",
    description: "On a short break",
  },
  abandoned: {
    label: "Abandoned",
    color: "status-abandoned",
    hsl: "hsl(var(--st-abandoned))",
    description: "Flagged for hoarding",
  },
  maintenance: {
    label: "Maintenance",
    color: "status-maintenance",
    hsl: "hsl(var(--st-maintenance))",
    description: "Temporarily unavailable",
  },
};

export const STATUS_ORDER: SeatStatus[] = [
  "available",
  "occupied",
  "away",
  "abandoned",
  "maintenance",
];