import { prisma } from "../prisma/client.js";
import { badRequest, notFound } from "./errors.js";

interface CreateIssueInput {
  seatNumber: string;
  issueType: string;
  description?: string;
}

/**
 * Create an issue report with status PENDING_APPROVAL.
 * The seat is NOT changed to MAINTENANCE here — an admin must explicitly
 * approve the issue via approveIssue() before that happens.
 */
export async function createIssue({
  seatNumber,
  issueType,
  description,
}: CreateIssueInput) {
  if (!seatNumber || !issueType) {
    throw badRequest("seatNumber and issueType are required");
  }

  const seat = await prisma.seat.findUnique({ where: { seatNumber } });
  if (!seat) throw notFound(`Seat ${seatNumber} not found`);

  return prisma.issueReport.create({
    data: {
      seatId: seat.id,
      issueType,
      description: description ?? null,
      status: "PENDING_APPROVAL",
    },
  });
}

/**
 * Admin approves an issue → seat becomes MAINTENANCE, active session closed.
 * Issue status moves to APPROVED.
 */
export async function approveIssue(issueId: string) {
  const issue = await prisma.issueReport.findUnique({
    where: { id: issueId },
    include: {
      seat: { include: { sessions: { where: { isActive: true } } } },
    },
  });
  if (!issue) throw notFound(`Issue ${issueId} not found`);

  const { seat } = issue;
  const active = seat.sessions[0];

  await prisma.$transaction([
    prisma.issueReport.update({
      where: { id: issueId },
      data: { status: "APPROVED" },
    }),
    prisma.seat.update({
      where: { id: seat.id },
      data: { status: "MAINTENANCE" },
    }),
    ...(active
      ? [prisma.session.update({
          where: { id: active.id },
          data: { isActive: false },
        })]
      : []),
  ]);

  return { approved: true, seatNumber: seat.seatNumber };
}

/**
 * Admin dismisses an issue → closes it without changing the seat.
 */
export async function dismissIssue(issueId: string) {
  const issue = await prisma.issueReport.findUnique({ where: { id: issueId } });
  if (!issue) throw notFound(`Issue ${issueId} not found`);

  await prisma.issueReport.update({
    where: { id: issueId },
    data: { status: "DISMISSED" },
  });
  return { dismissed: true };
}

/** List issue reports, newest first (optionally filtered by status). */
export async function listIssues(status?: string) {
  const issues = await prisma.issueReport.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
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
