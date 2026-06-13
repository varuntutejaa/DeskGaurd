import type { SeatType, ZoneId } from "./types";

/**
 * Floor plan geometry — coordinate space: 1280 × 900 viewBox, origin top-left.
 *
 * Layout (matches hand-drawn sketch):
 *   TOP    — Entrance (center gap in top wall), Bag Lockers (L/R), Reception desk
 *   MIDDLE — Open Reading Left | Centre Bookshelves | Open Reading Right
 *   BOTTOM — Cubicle Zone Left | Discussion Rooms (2×2 glass) | Cubicle Zone Right
 */

export const FLOOR = { width: 1280, height: 900 } as const;

export const BUILDING = { x: 32, y: 32, w: 1216, h: 836 } as const;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type RoomKind = "enclosed" | "glass" | "open";

export interface RoomDef {
  id: string;
  label: string;
  kind: RoomKind;
  rect: Rect;
  zone?: ZoneId;
}

/* -------------------------------------------------------------------------
   Room areas
   ------------------------------------------------------------------------- */

export const ROOMS: RoomDef[] = [
  // Bag lockers flanking the entrance foyer
  {
    id: "locker-left",
    label: "Bag Lockers",
    kind: "enclosed",
    rect: { x: 52, y: 48, w: 125, h: 95 },
  },
  {
    id: "locker-right",
    label: "Bag Lockers",
    kind: "enclosed",
    rect: { x: 1103, y: 48, w: 125, h: 95 },
  },

  // Open reading areas left and right of the bookshelf column
  {
    id: "open-left",
    label: "Open Reading Area",
    kind: "open",
    zone: "open-left",
    rect: { x: 32, y: 160, w: 494, h: 408 },
  },
  {
    id: "open-right",
    label: "Open Reading Area",
    kind: "open",
    zone: "open-right",
    rect: { x: 754, y: 160, w: 494, h: 408 },
  },

  // Central bookshelf column
  {
    id: "bookshelf-center",
    label: "Book Collection",
    kind: "open",
    rect: { x: 536, y: 148, w: 208, h: 420 },
  },

  // Cubicle zones at bottom-left and bottom-right
  {
    id: "cubicle-left",
    label: "Cubicle Study Zone",
    kind: "open",
    zone: "cubicle-left",
    rect: { x: 32, y: 572, w: 400, h: 296 },
  },
  {
    id: "cubicle-right",
    label: "Cubicle Study Zone",
    kind: "open",
    zone: "cubicle-right",
    rect: { x: 848, y: 572, w: 400, h: 296 },
  },

  // Discussion rooms — 2×2 glass pods at bottom centre
  {
    id: "discussion-1",
    label: "Discussion Room 1",
    kind: "glass",
    rect: { x: 448, y: 578, w: 187, h: 136 },
  },
  {
    id: "discussion-2",
    label: "Discussion Room 2",
    kind: "glass",
    rect: { x: 645, y: 578, w: 187, h: 136 },
  },
  {
    id: "discussion-3",
    label: "Discussion Room 3",
    kind: "glass",
    rect: { x: 448, y: 724, w: 187, h: 136 },
  },
  {
    id: "discussion-4",
    label: "Discussion Room 4",
    kind: "glass",
    rect: { x: 645, y: 724, w: 187, h: 136 },
  },
];

/** Main entrance — gap in the TOP wall, centred horizontally. */
export const ENTRANCE = { x: 540, y: BUILDING.y, w: 200 } as const;

/** Reception counter inside the foyer (just below the entrance gap). */
export const RECEPTION: Rect = { x: 210, y: 52, w: 860, h: 68 };

/* -------------------------------------------------------------------------
   Bookshelf rendering
   ------------------------------------------------------------------------- */

export interface ShelfDef {
  rect: Rect;
  orientation: "vertical" | "horizontal";
}

export function shelvesFor(rect: Rect, orientation: "vertical" | "horizontal"): Rect[] {
  const shelves: Rect[] = [];
  if (orientation === "horizontal") {
    const barH = 14;
    const gap = 26;
    const left = rect.x + 16;
    const right = rect.x + rect.w - 16;
    let y = rect.y + 28;
    while (y + barH <= rect.y + rect.h - 24) {
      shelves.push({ x: left, y, w: right - left, h: barH });
      y += barH + gap;
    }
  } else {
    const barW = 14;
    const gap = 26;
    const top = rect.y + 16;
    const bottom = rect.y + rect.h - 24;
    let x = rect.x + 16;
    while (x + barW <= rect.x + rect.w - 16) {
      shelves.push({ x, y: top, w: barW, h: bottom - top });
      x += barW + gap;
    }
  }
  return shelves;
}

/* -------------------------------------------------------------------------
   Seat placement blocks
   ------------------------------------------------------------------------- */

export interface SeatBlock {
  zone: ZoneId;
  type: SeatType;
  prefix: string;
  area: Rect;
  rows: number;
  cols: number;
  chargingEvery: number;
}

export const SEAT_BLOCKS: SeatBlock[] = [
  // Open Left — Top cluster (seats face each other across a communal table)
  {
    zone: "open-left",
    type: "open-desk",
    prefix: "LA",
    area: { x: 52, y: 178, w: 454, h: 168 },
    rows: 2,
    cols: 5,
    chargingEvery: 3,
  },
  // Open Left — Bottom cluster
  {
    zone: "open-left",
    type: "open-desk",
    prefix: "LB",
    area: { x: 52, y: 368, w: 454, h: 168 },
    rows: 2,
    cols: 5,
    chargingEvery: 3,
  },
  // Open Right — Top cluster
  {
    zone: "open-right",
    type: "open-desk",
    prefix: "RA",
    area: { x: 774, y: 178, w: 454, h: 168 },
    rows: 2,
    cols: 5,
    chargingEvery: 3,
  },
  // Open Right — Bottom cluster
  {
    zone: "open-right",
    type: "open-desk",
    prefix: "RB",
    area: { x: 774, y: 368, w: 454, h: 168 },
    rows: 2,
    cols: 5,
    chargingEvery: 3,
  },
  // Cubicle Left — 3×4 private desks (4th row freed for bookshelves)
  {
    zone: "cubicle-left",
    type: "cubicle",
    prefix: "CL",
    area: { x: 52, y: 592, w: 360, h: 192 },
    rows: 3,
    cols: 4,
    chargingEvery: 2,
  },
  // Cubicle Right — 3×4 private desks
  {
    zone: "cubicle-right",
    type: "cubicle",
    prefix: "CR",
    area: { x: 868, y: 592, w: 360, h: 192 },
    rows: 3,
    cols: 4,
    chargingEvery: 2,
  },
];

export const SEAT_SIZE = 17;

/**
 * Returns the communal table rect(s) between consecutive row pairs for a
 * given seat block (open-desk blocks have one table per 2-row group).
 */
export function communalTablesForBlock(block: SeatBlock): Rect[] {
  if (block.type !== "open-desk") return [];
  const { area, rows } = block;
  const cellH = area.h / rows;
  const rects: Rect[] = [];
  for (let r = 0; r + 1 < rows; r += 2) {
    const topCy = area.y + cellH * (r + 0.5);
    const botCy = area.y + cellH * (r + 1.5);
    const cy = (topCy + botCy) / 2;
    const h = Math.min(28, botCy - topCy - 18);
    rects.push({ x: area.x - 4, y: cy - h / 2, w: area.w + 8, h });
  }
  return rects;
}

/* -------------------------------------------------------------------------
   Discussion room chair positions (5 chairs × 4 rooms, circular layout)
   Each room centre + 5 chairs at radius 45, 72° apart starting from -90°.
   ------------------------------------------------------------------------- */

interface ChairPosition {
  id: string;
  x: number;
  y: number;
}

/** Centre coordinates for the 4 discussion rooms. */
const DISCUSSION_ROOM_CENTRES: { cx: number; cy: number }[] = [
  { cx: 541.5, cy: 646 },  // Room 1 (top-left)
  { cx: 738.5, cy: 646 },  // Room 2 (top-right)
  { cx: 541.5, cy: 792 },  // Room 3 (bottom-left)
  { cx: 738.5, cy: 792 },  // Room 4 (bottom-right)
];

/**
 * 5 chairs at 72° intervals starting from the top (-90°), radius 45.
 * Pre-computed sin/cos values to avoid rounding drift.
 */
const CHAIR_R = 45;
const CHAIR_ANGLES = [-90, -18, 54, 126, 198]; // degrees

export function buildDiscussionChairs(): ChairPosition[] {
  const chairs: ChairPosition[] = [];
  let n = 0;
  for (const { cx, cy } of DISCUSSION_ROOM_CENTRES) {
    for (const deg of CHAIR_ANGLES) {
      n += 1;
      const rad = (deg * Math.PI) / 180;
      chairs.push({
        id: `DR${String(n).padStart(2, "0")}`,
        x: Math.round(cx + Math.cos(rad) * CHAIR_R),
        y: Math.round(cy + Math.sin(rad) * CHAIR_R),
      });
    }
  }
  return chairs;
}

/** Pre-computed chair positions for use in seat generation + map rendering. */
export const DISCUSSION_CHAIRS: ChairPosition[] = buildDiscussionChairs();