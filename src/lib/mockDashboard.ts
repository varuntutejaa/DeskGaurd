import { FALLBACK_SEATS } from "@/features/seats/generate";
import type {
  DashStats,
  ZoneUtil,
  RecentSession,
  FlaggedSeat,
  TrendPoint,
  IssueRow,
} from "./api";

function buildStats(): DashStats {
  const total      = FALLBACK_SEATS.length;
  const free       = FALLBACK_SEATS.filter((s) => s.status === "available").length;
  const occupied   = FALLBACK_SEATS.filter((s) => s.status === "occupied").length;
  const away       = FALLBACK_SEATS.filter((s) => s.status === "away").length;
  const abandoned  = FALLBACK_SEATS.filter((s) => s.status === "abandoned").length;
  const maintenance = FALLBACK_SEATS.filter((s) => s.status === "maintenance").length;
  const inUse = occupied + away + abandoned;
  return {
    total, free, occupied, away, abandoned, maintenance,
    occupancyPct: Math.round((inUse / total) * 100),
    activeSessions: inUse,
    openIssues: 2,
  };
}

function buildZones(): ZoneUtil[] {
  const ids = [
    "open-left", "open-right",
    "cubicle-left", "cubicle-right",
    "discussion-rooms",
  ] as const;
  return ids.map((zone) => {
    const seats = FALLBACK_SEATS.filter((s) => s.zone === zone);
    const inUse = seats.filter(
      (s) => s.status === "occupied" || s.status === "away" || s.status === "abandoned"
    ).length;
    return {
      zone,
      total: seats.length,
      inUse,
      occupancyPct: seats.length ? Math.round((inUse / seats.length) * 100) : 0,
    };
  });
}

function buildTrends(): TrendPoint[] {
  const now   = Date.now();
  const total = FALLBACK_SEATS.length;
  // Typical library day: quiet early, builds 9–11am, steady through afternoon
  const factors = [0.04, 0.03, 0.03, 0.05, 0.10, 0.22, 0.38, 0.52, 0.60, 0.62, 0.58, 0.55];
  return factors.map((f, i) => {
    const at       = new Date(now - (11 - i) * 3_600_000).toISOString();
    const occupied = Math.round(total * f * 0.70);
    const away     = Math.round(total * f * 0.15);
    const abandoned = Math.round(total * f * 0.05);
    return { at, occupied, away, abandoned, total,
      occupancyPct: Math.round(((occupied + away + abandoned) / total) * 100) };
  });
}

const NOW = Date.now();

const MOCK_SESSIONS: RecentSession[] = [
  { id:"s1", seatNumber:"LA03", zone:"open-left",       seatType:"OPEN",       status:"OCCUPIED",  active:true,  checkedInAt: new Date(NOW-5400000).toISOString(),  durationSec:5400  },
  { id:"s2", seatNumber:"CL02", zone:"cubicle-left",    seatType:"CUBICLE",    status:"OCCUPIED",  active:true,  checkedInAt: new Date(NOW-7200000).toISOString(),  durationSec:7200  },
  { id:"s3", seatNumber:"DR05", zone:"discussion-rooms",seatType:"DISCUSSION", status:"OCCUPIED",  active:true,  checkedInAt: new Date(NOW-3600000).toISOString(),  durationSec:3600  },
  { id:"s4", seatNumber:"RA07", zone:"open-right",      seatType:"OPEN",       status:"AWAY",      active:true,  checkedInAt: new Date(NOW-4500000).toISOString(),  durationSec:4500  },
  { id:"s5", seatNumber:"CR04", zone:"cubicle-right",   seatType:"CUBICLE",    status:"OCCUPIED",  active:true,  checkedInAt: new Date(NOW-9000000).toISOString(),  durationSec:9000  },
  { id:"s6", seatNumber:"LB09", zone:"open-left",       seatType:"OPEN",       status:"ABANDONED", active:false, checkedInAt: new Date(NOW-14400000).toISOString(), durationSec:14400 },
  { id:"s7", seatNumber:"RB02", zone:"open-right",      seatType:"OPEN",       status:"OCCUPIED",  active:true,  checkedInAt: new Date(NOW-1800000).toISOString(),  durationSec:1800  },
  { id:"s8", seatNumber:"CL08", zone:"cubicle-left",    seatType:"CUBICLE",    status:"AWAY",      active:true,  checkedInAt: new Date(NOW-6000000).toISOString(),  durationSec:6000  },
];

const MOCK_FLAGGED: FlaggedSeat[] = [
  { seatNumber:"LB09", zone:"open-left",    status:"ABANDONED",   since: new Date(NOW-14400000).toISOString() },
  { seatNumber:"DR01", zone:"discussion-rooms", status:"MAINTENANCE", since: null },
];

const MOCK_ISSUES: IssueRow[] = [
  { id:"i1", seatNumber:"LB09", zone:"open-left",    issueType:"HOARDING",    description:"Belongings left unattended", status:"OPEN", createdAt: new Date(NOW-14400000).toISOString() },
  { id:"i2", seatNumber:"CL11", zone:"cubicle-left", issueType:"MAINTENANCE", description:"Chair wobbling",             status:"OPEN", createdAt: new Date(NOW-86400000).toISOString() },
];

export const MOCK_DASHBOARD = {
  stats:    buildStats(),
  zones:    buildZones(),
  sessions: MOCK_SESSIONS,
  flagged:  MOCK_FLAGGED,
  trends:   buildTrends(),
  issues:   MOCK_ISSUES,
};
