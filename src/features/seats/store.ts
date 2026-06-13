import { create } from "zustand";
import { FALLBACK_SEATS, buildLayout } from "./generate";
import { api, type ApiSeat, type ApiSeatStatus, type ApiSeatType } from "@/lib/api";
import {
  STATUS_ORDER,
  type Seat,
  type SeatStatus,
  type SeatType,
  type ZoneId,
} from "./types";

export interface Filters {
  query: string;
  status: SeatStatus | "all";
  zone: ZoneId | "all";
  type: SeatType | "all";
}

const DEFAULT_FILTERS: Filters = {
  query: "",
  status: "all",
  zone: "all",
  type: "all",
};

const AWAY_LIMIT = 20 * 60; // seconds, matches backend away timeout

const STATUS_MAP: Record<ApiSeatStatus, SeatStatus> = {
  FREE: "available",
  OCCUPIED: "occupied",
  AWAY: "away",
  ABANDONED: "abandoned",
  MAINTENANCE: "maintenance",
};

const TYPE_MAP: Record<ApiSeatType, SeatType> = {
  CUBICLE: "cubicle",
  OPEN: "open-desk",
  SILENT: "open-desk",
  DISCUSSION: "discussion",
};

const LAYOUT = buildLayout();
const MY_SEAT_KEY = "deskguard.mySeat";

const loadMySeat = () => {
  try {
    return localStorage.getItem(MY_SEAT_KEY);
  } catch {
    return null;
  }
};
const persistMySeat = (id: string | null) => {
  try {
    if (id) localStorage.setItem(MY_SEAT_KEY, id);
    else localStorage.removeItem(MY_SEAT_KEY);
  } catch {
    /* ignore */
  }
};

/** Merge backend seat data with the frontend spatial layout. */
function mapSeat(raw: ApiSeat, nowMs: number): Seat | null {
  const pos = LAYOUT[raw.seatNumber];
  if (!pos) return null; // unknown seat — skip rather than draw it off-plan

  const status = STATUS_MAP[raw.status];
  const session = raw.activeSession;

  let occupiedFor = 0;
  let awayRemaining = 0;
  if (session) {
    occupiedFor = Math.max(
      0,
      Math.floor((nowMs - new Date(session.checkedInAt).getTime()) / 1000)
    );
    if (status === "away" && session.awayStartedAt) {
      const awayFor = Math.floor(
        (nowMs - new Date(session.awayStartedAt).getTime()) / 1000
      );
      awayRemaining = Math.max(0, AWAY_LIMIT - awayFor);
    }
  }

  return {
    id: raw.seatNumber,
    type: TYPE_MAP[raw.seatType],
    status,
    zone: raw.zone as ZoneId,
    hasCharging: raw.hasChargingPort,
    amenity: pos.amenity,
    x: pos.x,
    y: pos.y,
    occupiedFor,
    awayRemaining,
  };
}

interface LibraryState {
  raw: ApiSeat[];
  seats: Seat[];
  selectedId: string | null;
  mySeatId: string | null;
  filters: Filters;
  loading: boolean;
  error: string | null;

  /* data */
  fetchSeats: () => Promise<void>;
  recompute: () => void;

  /* selection + filters */
  select: (id: string | null) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;

  /* session actions — optimistic-local, background API sync */
  checkIn: (seatNumber: string) => void;
  goAway: () => void;
  confirmPresence: () => void;
  checkOut: () => void;
  reportIssue: (seatNumber: string) => void;
}

export const useLibrary = create<LibraryState>((set, get) => ({
  raw: [],
  seats: FALLBACK_SEATS,
  selectedId: null,
  mySeatId: loadMySeat(),
  filters: DEFAULT_FILTERS,
  loading: true,
  error: null,

  fetchSeats: async () => {
    try {
      const raw = await api.getSeats();
      const now = Date.now();
      const seats = raw
        .map((r) => mapSeat(r, now))
        .filter((s): s is Seat => s !== null);

      // reconcile "my seat": clear if the session no longer holds it
      let mySeatId = get().mySeatId;
      if (mySeatId) {
        const mine = seats.find((s) => s.id === mySeatId);
        if (!mine || (mine.status !== "occupied" && mine.status !== "away")) {
          mySeatId = null;
          persistMySeat(null);
        }
      }

      set({ raw, seats, mySeatId, loading: false, error: null });
    } catch {
      // Only reset to fallback on the very first load (seats still empty)
      set((s) => ({
        seats: s.seats.length ? s.seats : FALLBACK_SEATS,
        loading: false,
        error: null,
      }));
    }
  },

  recompute: () => {
    const { raw } = get();
    if (raw.length) {
      // Backend mode: recompute from server data
      const now = Date.now();
      const seats = raw
        .map((r) => mapSeat(r, now))
        .filter((s): s is Seat => s !== null);
      set({ seats });
      return;
    }
    // Offline mode: tick session timers every second
    set((s) => ({
      seats: s.seats.map((seat) => {
        if (seat.status === "occupied") {
          return { ...seat, occupiedFor: seat.occupiedFor + 1 };
        }
        if (seat.status === "away") {
          return {
            ...seat,
            occupiedFor: seat.occupiedFor + 1,
            awayRemaining: Math.max(0, seat.awayRemaining - 1),
          };
        }
        return seat;
      }),
    }));
  },

  select: (id) => set({ selectedId: id }),
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  checkIn: (seatNumber) => {
    persistMySeat(seatNumber);
    set((s) => ({
      mySeatId: seatNumber,
      selectedId: seatNumber,
      seats: s.seats.map((seat) =>
        seat.id === seatNumber
          ? { ...seat, status: "occupied" as SeatStatus, occupiedFor: 0 }
          : seat
      ),
    }));
    // Background sync — doesn't block UI
    api.checkIn(seatNumber).then(() => get().fetchSeats()).catch(() => {});
  },

  goAway: () => {
    const seatNumber = get().mySeatId;
    if (!seatNumber) return;
    set((s) => ({
      seats: s.seats.map((seat) =>
        seat.id === seatNumber
          ? { ...seat, status: "away" as SeatStatus, awayRemaining: AWAY_LIMIT }
          : seat
      ),
    }));
    api.away(seatNumber).then(() => get().fetchSeats()).catch(() => {});
  },

  confirmPresence: () => {
    const seatNumber = get().mySeatId;
    if (!seatNumber) return;
    set((s) => ({
      seats: s.seats.map((seat) =>
        seat.id === seatNumber
          ? { ...seat, status: "occupied" as SeatStatus, awayRemaining: 0 }
          : seat
      ),
    }));
    api.confirm(seatNumber).then(() => get().fetchSeats()).catch(() => {});
  },

  checkOut: () => {
    const seatNumber = get().mySeatId;
    if (!seatNumber) return;
    persistMySeat(null);
    set((s) => ({
      mySeatId: null,
      seats: s.seats.map((seat) =>
        seat.id === seatNumber
          ? { ...seat, status: "available" as SeatStatus, occupiedFor: 0 }
          : seat
      ),
    }));
    api.checkOut(seatNumber).then(() => get().fetchSeats()).catch(() => {});
  },

  reportIssue: (seatNumber) => {
    const isMySeat = get().mySeatId === seatNumber;
    if (isMySeat) persistMySeat(null);
    set((s) => ({
      mySeatId: isMySeat ? null : s.mySeatId,
      seats: s.seats.map((seat) =>
        seat.id === seatNumber
          ? { ...seat, status: "maintenance" as SeatStatus }
          : seat
      ),
    }));
    api.reportIssue(seatNumber, "OTHER").then(() => get().fetchSeats()).catch(() => {});
  },
}));

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export type StatusCounts = Record<SeatStatus, number> & { total: number };

export function countByStatus(seats: Seat[]): StatusCounts {
  const counts = { total: seats.length } as StatusCounts;
  for (const s of STATUS_ORDER) counts[s] = 0;
  for (const seat of seats) counts[seat.status] += 1;
  return counts;
}

export function filterSeats(seats: Seat[], f: Filters): Seat[] {
  const q = f.query.trim().toLowerCase();
  return seats.filter((seat) => {
    if (q && !seat.id.toLowerCase().includes(q)) return false;
    if (f.status !== "all" && seat.status !== f.status) return false;
    if (f.zone !== "all" && seat.zone !== f.zone) return false;
    if (f.type !== "all" && seat.type !== f.type) return false;
    return true;
  });
}
