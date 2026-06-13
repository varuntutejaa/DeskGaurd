import { PrismaClient, SeatType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Mirrors the frontend SEAT_BLOCKS (src/features/seats/geometry.ts).
 * Seat IDs generated here must match what buildLayout() produces on the client.
 *
 * Blocks:
 *   LA01-LA10  Open Left  Top         (2×5 OPEN)
 *   LB01-LB10  Open Left  Bottom      (2×5 OPEN)
 *   RA01-RA10  Open Right Top         (2×5 OPEN)
 *   RB01-RB10  Open Right Bottom      (2×5 OPEN)
 *   CL01-CL16  Cubicle Left           (4×4 CUBICLE)
 *   CR01-CR12  Cubicle Right          (3×4 CUBICLE)
 *   DR01-DR20  Discussion Rooms       (5 chairs × 4 rooms DISCUSSION)
 *                                                       Total: 88 seats
 */
interface SeedBlock {
  zone: string;
  type: SeatType;
  prefix: string;
  rows: number;
  cols: number;
  chargingEvery: number;
}

const BLOCKS: SeedBlock[] = [
  { zone: "open-left",    type: "OPEN",    prefix: "LA", rows: 2, cols: 5, chargingEvery: 3 },
  { zone: "open-left",    type: "OPEN",    prefix: "LB", rows: 2, cols: 5, chargingEvery: 3 },
  { zone: "open-right",   type: "OPEN",    prefix: "RA", rows: 2, cols: 5, chargingEvery: 3 },
  { zone: "open-right",   type: "OPEN",    prefix: "RB", rows: 2, cols: 5, chargingEvery: 3 },
  { zone: "cubicle-left", type: "CUBICLE", prefix: "CL", rows: 4, cols: 4, chargingEvery: 2 },
  { zone: "cubicle-right",type: "CUBICLE", prefix: "CR", rows: 3, cols: 4, chargingEvery: 2 },
];

/** Discussion room chair ids: DR01-DR20 (5 chairs × 4 rooms) */
const DISCUSSION_IDS = Array.from({ length: 20 }, (_, i) => `DR${String(i + 1).padStart(2, "0")}`);

function buildSeats() {
  const seats: {
    seatNumber: string;
    seatType: SeatType;
    zone: string;
    hasChargingPort: boolean;
  }[] = [];

  for (const block of BLOCKS) {
    const count = block.rows * block.cols;
    for (let n = 1; n <= count; n++) {
      seats.push({
        seatNumber: `${block.prefix}${String(n).padStart(2, "0")}`,
        seatType: block.type,
        zone: block.zone,
        hasChargingPort: block.chargingEvery > 0 && n % block.chargingEvery === 0,
      });
    }
  }

  // Discussion room chairs
  for (const id of DISCUSSION_IDS) {
    seats.push({
      seatNumber: id,
      seatType: "DISCUSSION" as SeatType,
      zone: "discussion-rooms",
      hasChargingPort: false,
    });
  }

  return seats;
}

async function backfillSnapshots(total: number) {
  await prisma.occupancySnapshot.deleteMany();
  // Believable occupancy curve over 12 hours for a university library
  const curve = [4, 8, 14, 22, 30, 38, 35, 28, 33, 44, 50, 42];
  const now = Date.now();
  const points = curve.map((occupied, i) => {
    const away = Math.round(occupied * 0.18);
    const abandoned = i > 2 ? Math.round(occupied * 0.06) : 0;
    const maintenance = 2;
    const free = Math.max(0, total - occupied - away - abandoned - maintenance);
    return {
      at: new Date(now - (curve.length - 1 - i) * 60 * 60 * 1000),
      total,
      occupied,
      away,
      abandoned,
      maintenance,
      free,
    };
  });
  await prisma.occupancySnapshot.createMany({ data: points });
  console.log(`✓ Backfilled ${points.length} occupancy snapshots.`);
}

async function main() {
  const seats = buildSeats();
  console.log(`Seeding ${seats.length} seats…`);

  // Clean slate — cascades to sessions, issues, snapshots.
  await prisma.seat.deleteMany();

  for (const seat of seats) {
    await prisma.seat.create({ data: seat });
  }

  const total = await prisma.seat.count();
  console.log(`✓ Seeded ${total} seats (all FREE).`);

  await backfillSnapshots(total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });