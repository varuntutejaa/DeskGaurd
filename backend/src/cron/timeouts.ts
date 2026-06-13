import cron from "node-cron";
import { prisma } from "../prisma/client.js";
import { recordSnapshot } from "../services/dashboard.service.js";

const AWAY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
const PRESENCE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Sweep stale sessions. Runs every minute.
 *  - AWAY > 20 min   → seat FREE, session inactive
 *  - presence > 2 hr → seat ABANDONED, session inactive
 */
export async function runTimeoutSweep(now = new Date()) {
  const awayCutoff = new Date(now.getTime() - AWAY_TIMEOUT_MS);
  const presenceCutoff = new Date(now.getTime() - PRESENCE_TIMEOUT_MS);

  // --- Away timeout: away for too long → release the seat ---
  const expiredAway = await prisma.session.findMany({
    where: {
      isActive: true,
      seat: { status: "AWAY" },
      awayStartedAt: { lt: awayCutoff },
    },
    select: { id: true, seatId: true },
  });

  for (const s of expiredAway) {
    await prisma.$transaction([
      prisma.seat.update({ where: { id: s.seatId }, data: { status: "FREE" } }),
      prisma.session.update({ where: { id: s.id }, data: { isActive: false } }),
    ]);
  }

  // --- Presence timeout: not confirmed in 2h → flag as abandoned ---
  const stalePresence = await prisma.session.findMany({
    where: {
      isActive: true,
      seat: { status: { in: ["OCCUPIED", "AWAY"] } },
      lastConfirmedAt: { lt: presenceCutoff },
    },
    select: { id: true, seatId: true },
  });

  for (const s of stalePresence) {
    await prisma.$transaction([
      prisma.seat.update({
        where: { id: s.seatId },
        data: { status: "ABANDONED" },
      }),
      prisma.session.update({ where: { id: s.id }, data: { isActive: false } }),
    ]);
  }

  if (expiredAway.length || stalePresence.length) {
    console.log(
      `[cron] released ${expiredAway.length} away-timeout, flagged ${stalePresence.length} abandoned`
    );
  }
}

export function startTimeoutCron() {
  // every minute: sweep stale sessions, then record an occupancy snapshot
  cron.schedule("* * * * *", async () => {
    try {
      await runTimeoutSweep();
      await recordSnapshot();
    } catch (err) {
      console.error("[cron] tick failed", err);
    }
  });
  console.log("[cron] timeout sweep + snapshot scheduled (every minute)");
}
