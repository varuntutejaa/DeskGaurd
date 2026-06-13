import { SEAT_BLOCKS, DISCUSSION_CHAIRS } from "./geometry";
import type { Seat, SeatStatus, SeatType } from "./types";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x5eed);

function seedStatus(): SeatStatus {
  const r = rand();
  if (r < 0.18) return "occupied";
  if (r < 0.82) return "available";
  if (r < 0.90) return "away";
  if (r < 0.96) return "abandoned";
  return "maintenance";
}

const WINDOW_AMENITY = "Window view";
const CHARGING_AMENITY = "Near charging port";

function amenityFor(type: SeatType, hasCharging: boolean, edge: boolean): string | undefined {
  if (hasCharging) return CHARGING_AMENITY;
  if (type === "open-desk" && edge) return WINDOW_AMENITY;
  return undefined;
}

export function generateSeats(): Seat[] {
  const seats: Seat[] = [];

  for (const block of SEAT_BLOCKS) {
    const { area, rows, cols } = block;
    const cellW = area.w / cols;
    const cellH = area.h / rows;
    let n = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        n += 1;
        const x = area.x + cellW * (c + 0.5);
        const y = area.y + cellH * (r + 0.5);

        const status = seedStatus();
        const hasCharging = block.chargingEvery > 0 && n % block.chargingEvery === 0;
        const edge = c === 0 || c === cols - 1 || r === 0 || r === rows - 1;

        const occupied = status === "occupied" || status === "away";
        const abandoned = status === "abandoned";

        seats.push({
          id: `${block.prefix}${String(n).padStart(2, "0")}`,
          type: block.type,
          status,
          zone: block.zone,
          hasCharging,
          amenity: amenityFor(block.type, hasCharging, edge),
          x,
          y,
          occupiedFor: occupied ? Math.floor(600 + rand() * 9000) : abandoned ? Math.floor(7200 + rand() * 7200) : 0,
          awayRemaining: status === "away" ? Math.floor(120 + rand() * 600) : 0,
        });
      }
    }
  }

  // Fixed realistic status pattern for 20 discussion chairs (5 per room × 4 rooms)
  // Gives a live mix: some maintenance, some free, some occupied
  const DISC_STATUSES: SeatStatus[] = [
    // Room 1
    "available", "available", "occupied",  "available", "available",
    // Room 2
    "available", "available", "available", "away",      "available",
    // Room 3
    "available", "available", "available", "available", "maintenance",
    // Room 4
    "available", "occupied",  "available", "available", "available",
  ];

  // Discussion room chairs (5 per room × 4 rooms = 20)
  for (let i = 0; i < DISCUSSION_CHAIRS.length; i++) {
    const chair = DISCUSSION_CHAIRS[i];
    const status: SeatStatus = DISC_STATUSES[i];
    const occupied = status === "occupied" || status === "away";
    const abandoned = status === "abandoned";

    seats.push({
      id: chair.id,
      type: "discussion",
      status,
      zone: "discussion-rooms",
      hasCharging: false,
      amenity: undefined,
      x: chair.x,
      y: chair.y,
      occupiedFor: occupied ? Math.floor(600 + rand() * 9000) : abandoned ? Math.floor(7200 + rand() * 7200) : 0,
      awayRemaining: status === "away" ? Math.floor(120 + rand() * 600) : 0,
    });
  }


  return seats;
}

export const TOTAL_SEATS = SEAT_BLOCKS.reduce((sum, b) => sum + b.rows * b.cols, 0) + DISCUSSION_CHAIRS.length;

/** Pre-computed once — import this instead of calling generateSeats() yourself. */
export const FALLBACK_SEATS = generateSeats();

export interface SeatLayout {
  x: number;
  y: number;
  amenity?: string;
}

export function buildLayout(): Record<string, SeatLayout> {
  const layout: Record<string, SeatLayout> = {};

  for (const block of SEAT_BLOCKS) {
    const { area, rows, cols } = block;
    const cellW = area.w / cols;
    const cellH = area.h / rows;
    let n = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        n += 1;
        const id = `${block.prefix}${String(n).padStart(2, "0")}`;
        const hasCharging = block.chargingEvery > 0 && n % block.chargingEvery === 0;
        const edge = c === 0 || c === cols - 1 || r === 0 || r === rows - 1;
        layout[id] = {
          x: area.x + cellW * (c + 0.5),
          y: area.y + cellH * (r + 0.5),
          amenity: amenityFor(block.type, hasCharging, edge),
        };
      }
    }
  }

  // Discussion chairs
  for (const chair of DISCUSSION_CHAIRS) {
    layout[chair.id] = { x: chair.x, y: chair.y };
  }

  return layout;
}