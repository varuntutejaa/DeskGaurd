import type { SeatStatus } from "@prisma/client";
import { prisma } from "../prisma/client.js";

const IN_USE: SeatStatus[] = ["OCCUPIED", "AWAY", "ABANDONED"];

async function statusCounts() {
  const grouped = await prisma.seat.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<SeatStatus, number> = {
    FREE: 0,
    OCCUPIED: 0,
    AWAY: 0,
    ABANDONED: 0,
    MAINTENANCE: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;
  return counts;
}

export async function getStats() {
  const counts = await statusCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const inUse = counts.OCCUPIED + counts.AWAY + counts.ABANDONED;
  const [activeSessions, openIssues] = await Promise.all([
    prisma.session.count({ where: { isActive: true } }),
    prisma.issueReport.count({ where: { status: "OPEN" } }),
  ]);

  return {
    total,
    free: counts.FREE,
    occupied: counts.OCCUPIED,
    away: counts.AWAY,
    abandoned: counts.ABANDONED,
    maintenance: counts.MAINTENANCE,
    occupancyPct: total ? Math.round((inUse / total) * 100) : 0,
    activeSessions,
    openIssues,
  };
}

export async function getZoneUtilization() {
  const seats = await prisma.seat.findMany({
    select: { zone: true, status: true },
  });
  const map = new Map<string, { total: number; inUse: number }>();
  for (const s of seats) {
    const z = map.get(s.zone) ?? { total: 0, inUse: 0 };
    z.total += 1;
    if (IN_USE.includes(s.status)) z.inUse += 1;
    map.set(s.zone, z);
  }
  return [...map.entries()]
    .map(([zone, v]) => ({
      zone,
      total: v.total,
      inUse: v.inUse,
      occupancyPct: v.total ? Math.round((v.inUse / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.occupancyPct - a.occupancyPct);
}

export async function getRecentSessions(limit = 8) {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { seat: true },
  });
  const now = Date.now();
  return sessions.map((s) => {
    const end = s.isActive ? now : s.lastConfirmedAt.getTime();
    return {
      id: s.id,
      seatNumber: s.seat.seatNumber,
      zone: s.seat.zone,
      seatType: s.seat.seatType,
      status: s.seat.status,
      active: s.isActive,
      checkedInAt: s.checkedInAt,
      durationSec: Math.max(0, Math.floor((end - s.checkedInAt.getTime()) / 1000)),
    };
  });
}

export async function getFlaggedSeats() {
  const seats = await prisma.seat.findMany({
    where: { status: { in: ["ABANDONED", "MAINTENANCE"] } },
    include: { sessions: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { seatNumber: "asc" },
  });
  return seats.map((s) => ({
    seatNumber: s.seatNumber,
    zone: s.zone,
    status: s.status,
    since: s.sessions[0]?.lastConfirmedAt ?? null,
  }));
}

export async function getTrends(hours = 12) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const snapshots = await prisma.occupancySnapshot.findMany({
    where: { at: { gte: since } },
    orderBy: { at: "asc" },
  });
  return snapshots.map((s) => ({
    at: s.at,
    occupied: s.occupied,
    away: s.away,
    abandoned: s.abandoned,
    total: s.total,
    occupancyPct: s.total
      ? Math.round(((s.occupied + s.away + s.abandoned) / s.total) * 100)
      : 0,
  }));
}

/** Record a point-in-time occupancy snapshot (called by cron). */
export async function recordSnapshot() {
  const counts = await statusCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  await prisma.occupancySnapshot.create({
    data: {
      total,
      free: counts.FREE,
      occupied: counts.OCCUPIED,
      away: counts.AWAY,
      abandoned: counts.ABANDONED,
      maintenance: counts.MAINTENANCE,
    },
  });
}
