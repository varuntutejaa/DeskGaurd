import { prisma } from "../prisma/client.js";
import { badRequest, notFound } from "./errors.js";

interface CreateIssueInput {
  seatNumber: string;
  issueType: string;
  description?: string;
}

/**
 * Create an issue report. As a side effect the seat is flagged for
 * MAINTENANCE and any active session is closed — mirroring the
 * "Report an Issue" action already wired into the map sidebar.
 */
export async function createIssue({
  seatNumber,
  issueType,
  description,
}: CreateIssueInput) {
  if (!seatNumber || !issueType) {
    throw badRequest("seatNumber and issueType are required");
  }

  const seat = await prisma.seat.findUnique({
    where: { seatNumber },
    include: { sessions: { where: { isActive: true } } },
  });
  if (!seat) throw notFound(`Seat ${seatNumber} not found`);

  const active = seat.sessions[0];

  const [issue] = await prisma.$transaction([
    prisma.issueReport.create({
      data: {
        seatId: seat.id,
        issueType,
        description: description ?? null,
        status: "OPEN",
      },
    }),
    prisma.seat.update({
      where: { id: seat.id },
      data: { status: "MAINTENANCE" },
    }),
    ...(active
      ? [
          prisma.session.update({
            where: { id: active.id },
            data: { isActive: false },
          }),
        ]
      : []),
  ]);

  return issue;
}

/** List issue reports, newest first (optionally filtered by status). */
export async function listIssues(status?: string) {
  const issues = await prisma.issueReport.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { seat: true },
  });
  return issues.map((i) => ({
    id: i.id,
    seatNumber: i.seat.seatNumber,
    zone: i.seat.zone,
    issueType: i.issueType,
    description: i.description,
    status: i.status,
    createdAt: i.createdAt,
  }));
}
