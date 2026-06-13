/**
 * DeskGuard API layer. Talks to the Express/Prisma backend.
 * In dev, requests go through the Vite proxy (/api -> http://localhost:4000).
 */

const BASE = import.meta.env.VITE_API_URL ?? "";

export type ApiSeatStatus =
  | "FREE"
  | "OCCUPIED"
  | "AWAY"
  | "ABANDONED"
  | "MAINTENANCE";

export type ApiSeatType = "CUBICLE" | "OPEN" | "SILENT" | "DISCUSSION";

export interface ApiSession {
  id: string;
  checkedInAt: string;
  awayStartedAt: string | null;
  lastConfirmedAt: string;
}

export interface ApiSeat {
  id: string;
  seatNumber: string;
  status: ApiSeatStatus;
  seatType: ApiSeatType;
  zone: string;
  hasChargingPort: boolean;
  createdAt: string;
  /** Server-computed seconds the session has been active. */
  occupiedForSec: number;
  /** Server-computed seconds remaining before an AWAY seat is marked abandoned. */
  awayRemainingSec: number;
  activeSession: ApiSession | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

const seatPath = (seatNumber: string) =>
  `/seats/${encodeURIComponent(seatNumber)}`;

export const api = {
  getSeats: () => request<ApiSeat[]>("/seats"),

  checkIn: (seatNumber: string) =>
    request<ApiSeat>(`${seatPath(seatNumber)}/checkin`, { method: "POST" }),

  away: (seatNumber: string) =>
    request<ApiSeat>(`${seatPath(seatNumber)}/away`, { method: "POST" }),

  confirm: (seatNumber: string) =>
    request<ApiSeat>(`${seatPath(seatNumber)}/confirm`, { method: "POST" }),

  checkOut: (seatNumber: string) =>
    request<ApiSeat>(`${seatPath(seatNumber)}/checkout`, { method: "POST" }),

  reportIssue: (seatNumber: string, issueType: string, description?: string) =>
    request("/issues", {
      method: "POST",
      body: JSON.stringify({ seatNumber, issueType, description }),
    }),

  /* ---- auth ---- */

  login: (email: string, password: string) =>
    request<{ email: string; role: "student" | "admin" }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /* ---- students ---- */

  getStudents: () => request<Student[]>("/students"),
  addStudent: (data: Omit<Student, "id" | "createdAt"> & { password: string }) =>
    request<Student>("/students", { method: "POST", body: JSON.stringify(data) }),
  deleteStudent: (id: string) =>
    request<{ deleted: boolean }>(`/students/${id}`, { method: "DELETE" }),

  /* ---- dashboard ---- */
  stats: () => request<DashStats>("/dashboard/stats"),
  zones: () => request<ZoneUtil[]>("/dashboard/zones"),
  recentSessions: (limit = 8) =>
    request<RecentSession[]>(`/dashboard/sessions?limit=${limit}`),
  flagged: () => request<FlaggedSeat[]>("/dashboard/flagged"),
  trends: (hours = 12) => request<TrendPoint[]>(`/dashboard/trends?hours=${hours}`),
  issues: (status = "OPEN") => request<IssueRow[]>(`/issues?status=${status}`),
};

/* ---- student types ---- */
export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: number;
  phone?: string;
  addedBy: string;
  createdAt: string;
}

/* ---- dashboard response types ---- */
export interface DashStats {
  total: number;
  free: number;
  occupied: number;
  away: number;
  abandoned: number;
  maintenance: number;
  occupancyPct: number;
  activeSessions: number;
  openIssues: number;
}

export interface ZoneUtil {
  zone: string;
  total: number;
  inUse: number;
  occupancyPct: number;
}

export interface RecentSession {
  id: string;
  seatNumber: string;
  zone: string;
  seatType: ApiSeatType;
  status: ApiSeatStatus;
  active: boolean;
  checkedInAt: string;
  durationSec: number;
}

export interface FlaggedSeat {
  seatNumber: string;
  zone: string;
  status: ApiSeatStatus;
  since: string | null;
}

export interface TrendPoint {
  at: string;
  occupied: number;
  away: number;
  abandoned: number;
  total: number;
  occupancyPct: number;
}

export interface IssueRow {
  id: string;
  seatNumber: string;
  zone: string;
  issueType: string;
  description: string | null;
  status: string;
  createdAt: string;
}
