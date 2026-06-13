import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { conflict, notFound } from "./errors.js";

const AWAY_LIMIT_SEC = 20 * 60; // must match frontend constant

/** Seat with its single active session (if any) flattened for the API.
 *  Duration fields are computed server-side so the browser never needs a
 *  local clock tick — it just displays whatever the server sends. */
function serialize(
  seat: Prisma.SeatGetPayload<{ include: { sessions: true } }>
) {
  const active = seat.sessions.find((s) => s.isActive) ?? null;
  const nowMs  = Date.now();

  let occupiedForSec   = 0;
  let awayRemainingSec = 0;

  if (active) {
    occupiedForSec = Math.max(
      0,
      Math.floor((nowMs - active.checkedInAt.getTime()) / 1000)
    );
    if (seat.status === "AWAY" && active.awayStartedAt) {
      const awayFor = Math.floor(
        (nowMs - active.awayStartedAt.getTime()) / 1000
      );
      awayRemainingSec = Math.max(0, AWAY_LIMIT_SEC - awayFor);
    }
  }

  return {
    id: seat.id,
    seatNumber: seat.seatNumber,
    status: seat.status,
    seatType: seat.seatType,
    zone: seat.zone,
    hasChargingPort: seat.hasChargingPort,
    createdAt: seat.createdAt,
    occupiedForSec,
    awayRemainingSec,
    activeSession: active
      ? {
          id: active.id,
          checkedInAt: active.checkedInAt,
          awayStartedAt: active.awayStartedAt,
          lastConfirmedAt: active.lastConfirmedAt,
        }
      : null,
  };
}

async function getSeatBySeatNumber(seatNumber: string) {
  const seat = await prisma.seat.findUnique({
    where: { seatNumber },
    include: { sessions: { where: { isActive: true } } },
  });
  if (!seat) throw notFound(`Seat ${seatNumber} not found`);
  return seat;
}

export async function getAllSeats() {
  const seats = await prisma.seat.findMany({
    orderBy: { seatNumber: "asc" },
    include: { sessions: { where: { isActive: true } } },
  });
  return seats.map(serialize);
}

/** POST /checkin — seat must be FREE; opens an active session, seat → OCCUPIED. */
export async function checkIn(seatNumber: string) {
  const seat = await getSeatBySeatNumber(seatNumber);
  if (seat.status !== "FREE") {
    throw conflict(`Seat ${seatNumber} is not free (currently ${seat.status})`);
  }

  const now = new Date();
  const [updated] = await prisma.$transaction([
    prisma.seat.update({
      where: { id: seat.id },
      data: { status: "OCCUPIED" },
      include: { sessions: { where: { isActive: true } } },
    }),
    prisma.session.create({
      data: {
        seatId: seat.id,
        checkedInAt: now,
        lastConfirmedAt: now,
        isActive: true,
      },
    }),
  ]);

  // re-read so the freshly created session is included
  return serialize(await getSeatBySeatNumber(updated.seatNumber));
}

/** POST /away — seat must be OCCUPIED; seat → AWAY, awayStartedAt = now. */
export async function goAway(seatNumber: string) {
  const seat = await getSeatBySeatNumber(seatNumber);
  if (seat.status !== "OCCUPIED") {
    throw conflict(
      `Seat ${seatNumber} must be occupied to go away (currently ${seat.status})`
    );
  }
  const active = seat.sessions[0];
  if (!active) throw conflict(`Seat ${seatNumber} has no active session`);

  const now = new Date();
  await prisma.$transaction([
    prisma.seat.update({ where: { id: seat.id }, data: { status: "AWAY" } }),
    prisma.session.update({
      where: { id: active.id },
      data: { awayStartedAt: now },
    }),
  ]);
  return serialize(await getSeatBySeatNumber(seatNumber));
}

/** POST /confirm — refresh presence; if AWAY, return to OCCUPIED. */
export async function confirm(seatNumber: string) {
  const seat = await getSeatBySeatNumber(seatNumber);
  const active = seat.sessions[0];
  if (!active) {
    throw conflict(`Seat ${seatNumber} has no active session to confirm`);
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.session.update({
      where: { id: active.id },
      data: { lastConfirmedAt: now, awayStartedAt: null },
    }),
    ...(seat.status === "AWAY"
      ? [
          prisma.seat.update({
            where: { id: seat.id },
            data: { status: "OCCUPIED" },
          }),
        ]
      : []),
  ]);
  return serialize(await getSeatBySeatNumber(seatNumber));
}

/** POST /checkout — end the active session; seat → FREE. */
export async function checkOut(seatNumber: string) {
  const seat = await getSeatBySeatNumber(seatNumber);
  const active = seat.sessions[0];

  await prisma.$transaction([
    prisma.seat.update({ where: { id: seat.id }, data: { status: "FREE" } }),
    ...(active
      ? [
          prisma.session.update({
            where: { id: active.id },
            data: { isActive: false },
          }),
        ]
      : []),
  ]);
  return serialize(await getSeatBySeatNumber(seatNumber));
}
