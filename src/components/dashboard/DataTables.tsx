import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox } from "lucide-react";
import type { RecentSession, IssueRow, FlaggedSeat } from "@/lib/api";
import {
  STATUS_META,
  ZONE_LABEL,
  type SeatStatus,
  type ZoneId,
} from "@/features/seats/types";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

const API_STATUS: Record<string, SeatStatus> = {
  FREE: "available",
  OCCUPIED: "occupied",
  AWAY: "away",
  ABANDONED: "abandoned",
  MAINTENANCE: "maintenance",
};

const zoneLabel = (z: string) => ZONE_LABEL[z as ZoneId] ?? z;
const relTime = (iso: string | null) => {
  if (!iso) return "—";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m ago`;
};

type TabKey = "sessions" | "issues" | "flagged";

export function DataTables({
  sessions,
  issues,
  flagged,
}: {
  sessions: RecentSession[];
  issues: IssueRow[];
  flagged: FlaggedSeat[];
}) {
  const [tab, setTab] = useState<TabKey>("sessions");

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "sessions", label: "Recent Sessions", count: sessions.length },
    { key: "issues", label: "Open Issues", count: issues.length },
    { key: "flagged", label: "Flagged Seats", count: flagged.length },
  ];

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-xs">
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              tab === t.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                tab === t.key
                  ? "bg-primary-soft text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {t.count}
            </span>
            {tab === t.key && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-1.5 sm:p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "sessions" && <SessionsTable rows={sessions} />}
            {tab === "issues" && <IssuesTable rows={issues} />}
            {tab === "flagged" && <FlaggedTable rows={flagged} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- shared table primitives ---------- */
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const rowCls =
  "border-t border-border/70 transition-colors hover:bg-muted/40";
const seatCell = "px-3 py-3 font-mono font-medium";

function Empty({ label }: { label: string }) {
  return (
    <div className="grid place-items-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Inbox className="size-5" />
      </span>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function SessionsTable({ rows }: { rows: RecentSession[] }) {
  if (!rows.length) return <Empty label="No sessions yet." />;
  return (
    <Table head={["Seat", "Zone", "Status", "Duration", "Started"]}>
      {rows.map((r) => (
        <tr key={r.id} className={rowCls}>
          <td className={seatCell}>{r.seatNumber}</td>
          <td className="px-3 py-3 text-muted-foreground">{zoneLabel(r.zone)}</td>
          <td className="px-3 py-3">
            <StatusBadge status={API_STATUS[r.status]} />
          </td>
          <td className="px-3 py-3 font-mono tabular-nums">
            {formatDuration(r.durationSec)}
          </td>
          <td className="px-3 py-3 text-muted-foreground">{relTime(r.checkedInAt)}</td>
        </tr>
      ))}
    </Table>
  );
}

function IssuesTable({ rows }: { rows: IssueRow[] }) {
  if (!rows.length) return <Empty label="No open issues. Everything's running smoothly." />;
  return (
    <Table head={["Seat", "Type", "Description", "Reported"]}>
      {rows.map((r) => (
        <tr key={r.id} className={rowCls}>
          <td className={seatCell}>{r.seatNumber}</td>
          <td className="px-3 py-3">
            <span className="rounded-md bg-status-maintenance/10 px-2 py-0.5 text-[12px] font-medium text-status-maintenance">
              {r.issueType.replace(/_/g, " ").toLowerCase()}
            </span>
          </td>
          <td className="max-w-[280px] truncate px-3 py-3 text-muted-foreground">
            {r.description ?? "—"}
          </td>
          <td className="px-3 py-3 text-muted-foreground">{relTime(r.createdAt)}</td>
        </tr>
      ))}
    </Table>
  );
}

function FlaggedTable({ rows }: { rows: FlaggedSeat[] }) {
  if (!rows.length) return <Empty label="No flagged seats." />;
  return (
    <Table head={["Seat", "Zone", "Flag", "Since"]}>
      {rows.map((r) => (
        <tr key={r.seatNumber} className={rowCls}>
          <td className={seatCell}>{r.seatNumber}</td>
          <td className="px-3 py-3 text-muted-foreground">{zoneLabel(r.zone)}</td>
          <td className="px-3 py-3">
            <StatusBadge status={API_STATUS[r.status]} />
          </td>
          <td className="px-3 py-3 text-muted-foreground">
            {r.status === "ABANDONED" ? STATUS_META.abandoned.description : "—"} · {relTime(r.since)}
          </td>
        </tr>
      ))}
    </Table>
  );
}
