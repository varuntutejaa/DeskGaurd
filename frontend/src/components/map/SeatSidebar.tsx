import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, LogOut, Coffee, Flag, Zap,
  MapPin, Armchair, Undo2, CircleCheck,
  BookOpen, Users, Clock, Activity,
  Armchair as ChairIcon, Sparkles, ZapOff, X, Send, AlertTriangle,
} from "lucide-react";
import { useLibrary, countByStatus } from "@/features/seats/store";
import {
  SEAT_TYPE_LABEL, STATUS_META, STATUS_ORDER, ZONE_LABEL,
  type Seat, type ZoneId,
} from "@/features/seats/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SeatQR } from "./SeatQR";
import { formatDuration } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */
function OccupancyRing({ value, size = 48 }: { value: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(1, value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(var(--primary) / 0.15)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth={5} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

function ZoneBar({ zone, seats }: { zone: ZoneId; seats: Seat[] }) {
  const zoneSeats = seats.filter((s) => s.zone === zone);
  const inUse = zoneSeats.filter(
    (s) => s.status !== "available" && s.status !== "maintenance"
  ).length;
  const total = zoneSeats.length;
  const pct = total ? Math.round((inUse / total) * 100) : 0;
  const color =
    pct >= 80 ? "hsl(var(--st-occupied))"
    : pct >= 50 ? "hsl(var(--st-away))"
    : "hsl(var(--primary))";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[12px]">
        <span className="font-medium text-foreground">{ZONE_LABEL[zone]}</span>
        <span className="tabular-nums text-muted-foreground">{inUse}/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Library overview (empty state)
   ------------------------------------------------------------------------- */
function LibraryOverview() {
  const seats = useLibrary((s) => s.seats);
  const counts = countByStatus(seats);
  const inUse = counts.occupied + counts.away + counts.abandoned;
  const occupancy = counts.total ? Math.round((inUse / counts.total) * 100) : 0;
  const zones = Object.keys(ZONE_LABEL) as ZoneId[];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-0.5">
      {/* header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Library Overview
        </p>
        <h2 className="mt-0.5 text-lg font-semibold tracking-tight">Main Library</h2>
        <p className="text-[12px] text-muted-foreground">Level 2 · Real-time data</p>
      </div>

      {/* occupancy summary card */}
      <div className="flex items-center gap-4 rounded-xl border border-primary/15 bg-primary-soft/40 px-4 py-3.5">
        <OccupancyRing value={occupancy} size={52} />
        <div>
          <p className="font-display text-3xl font-bold tabular-nums leading-none text-primary">
            {occupancy}%
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-primary/70">Current occupancy</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {inUse} of {counts.total} seats in use
          </p>
        </div>
      </div>

      {/* status breakdown grid */}
      <div className="grid grid-cols-2 gap-2">
        {STATUS_ORDER.map((status) => (
          <div key={status}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-2.5 py-2"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: `hsl(var(--st-${status}))` }}
            />
            <div className="min-w-0">
              <p className="truncate text-[10.5px] text-muted-foreground">
                {STATUS_META[status].label}
              </p>
              <p className="font-mono text-base font-bold tabular-nums leading-tight">
                {counts[status]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* zone utilisation bars */}
      <div className="space-y-3 rounded-xl border border-border bg-background/60 p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Zone Utilisation
        </p>
        <div className="space-y-2.5">
          {zones.map((z) => (
            <ZoneBar key={z} zone={z} seats={seats} />
          ))}
        </div>
      </div>

      {/* quick facts */}
      <div className="grid grid-cols-2 gap-2">
        <QuickFact icon={BookOpen} label="Total Seats" value={String(counts.total)} />
        <QuickFact icon={Users} label="In Use" value={String(inUse)} />
        <QuickFact icon={Clock} label="Avg Session" value="~45 min" />
        <QuickFact icon={Activity} label="Peak Time" value="11am–2pm" />
      </div>

      {/* tip */}
      <div className="mt-auto rounded-xl border border-border bg-muted/30 p-3.5 text-[12px]">
        <p className="font-semibold text-foreground">How to check in</p>
        <p className="mt-1 text-muted-foreground leading-relaxed">
          Tap any{" "}
          <span className="font-medium text-status-available">green seat</span> on the
          map, then scan the QR code with your phone or use the button that appears.
          Sign in with your <span className="font-medium">@muj.manipal.edu</span> account.
        </p>
      </div>
    </div>
  );
}

function QuickFact({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate text-[10.5px] text-muted-foreground">{label}</p>
        <p className="font-mono text-[13px] font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Seat detail view
   ------------------------------------------------------------------------- */
function InfoCard({ seat }: { seat: Seat }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-background/60 p-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
        Seat Details
      </p>
      <InfoRow icon={MapPin} label="Zone" value={ZONE_LABEL[seat.zone]} />
      <InfoRow
        icon={Zap}
        label="Charging Port"
        value={seat.hasCharging ? "Available" : "Not available"}
        accent={seat.hasCharging}
      />
      <InfoRow
        icon={Armchair}
        label="Status"
        value={STATUS_META[seat.status].description}
      />
      {seat.amenity && (
        <InfoRow icon={MapPin} label="Amenity" value={seat.amenity} />
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon, label, value, accent,
}: {
  icon: React.ElementType; label: string; value: string; accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </span>
      <span className={`font-medium ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function Metric({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium text-muted-foreground">{label}</p>
      <p className={`font-mono text-lg font-semibold tabular-nums ${
        muted ? "text-muted-foreground" : "text-foreground"
      }`}>
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Issue type picker
   ------------------------------------------------------------------------- */
const ISSUE_TYPES = [
  { id: "CHAIR_BROKEN",           label: "Chair Broken",               icon: ChairIcon,  desc: "Damaged or unstable chair" },
  { id: "DIRTY_SPACE",            label: "Dirty Space",                icon: Sparkles,   desc: "Area needs cleaning" },
  { id: "CHARGING_NOT_WORKING",   label: "Charging Socket Not Working", icon: ZapOff,     desc: "Port is dead or damaged" },
] as const;

function IssueTypePicker({
  seatId,
  onClose,
}: {
  seatId: string;
  onClose: () => void;
}) {
  const reportIssue = useLibrary((s) => s.reportIssue);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!selected) return;
    reportIssue(seatId, selected);
    setSubmitted(true);
    setTimeout(onClose, 1400);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 p-5 text-center"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-status-available/15 text-status-available">
          <CircleCheck className="size-5" />
        </span>
        <p className="text-[13px] font-semibold">Report submitted</p>
        <p className="text-[12px] text-muted-foreground">The admin will review and take action.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          What's the issue?
        </p>
        <button onClick={onClose} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        {ISSUE_TYPES.map((it) => (
          <button
            key={it.id}
            onClick={() => setSelected(it.id)}
            className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[12.5px] transition-colors ${
              selected === it.id
                ? "border-primary/40 bg-primary-soft/50 text-foreground"
                : "border-border bg-background/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            <it.icon className={`size-3.5 shrink-0 ${selected === it.id ? "text-primary" : ""}`} />
            <div>
              <p className={`font-medium leading-tight ${selected === it.id ? "text-foreground" : ""}`}>
                {it.label}
              </p>
              <p className="text-[11px] opacity-70">{it.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <Button
        size="sm"
        className="w-full"
        disabled={!selected}
        onClick={submit}
      >
        <Send className="size-3.5" />
        Submit Report
      </Button>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
   Main sidebar
   ------------------------------------------------------------------------- */
export function SeatSidebar() {
  const seats          = useLibrary((s) => s.seats);
  const selectedId     = useLibrary((s) => s.selectedId);
  const mySeatId       = useLibrary((s) => s.mySeatId);
  const select          = useLibrary((s) => s.select);
  const checkIn         = useLibrary((s) => s.checkIn);
  const checkOut        = useLibrary((s) => s.checkOut);
  const goAway          = useLibrary((s) => s.goAway);
  const confirmPresence = useLibrary((s) => s.confirmPresence);

  const [showIssuePicker, setShowIssuePicker] = useState(false);

  const mySeat   = seats.find((s) => s.id === mySeatId) ?? null;
  const selected = seats.find((s) => s.id === selectedId) ?? null;
  const active   = selected ?? mySeat;

  if (!active) return <LibraryOverview />;

  const isMine         = active.id === mySeatId;
  const alreadyHasSeat = !!mySeatId && !isMine;
  const canCheckIn     = !isMine && !alreadyHasSeat && active.status === "available";
  const away           = isMine && active.status === "away";
  const statusMeta     = STATUS_META[active.status];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-0.5">

        {/* ── seat header ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
              {isMine ? "Your Seat" : "Selected Seat"}
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge status={active.status} />
              <button
                onClick={() => select(null)}
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close panel"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-3.5">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
              style={{ backgroundColor: statusMeta.hsl }}
            >
              <Armchair className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold tracking-tight leading-none">
                {active.id}
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                {SEAT_TYPE_LABEL[active.type]} · {ZONE_LABEL[active.zone]}
              </p>
            </div>
          </div>
        </div>

        {/* ── already-holding-a-seat warning ───────────────────────── */}
        {alreadyHasSeat && active.status === "available" && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px]">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-amber-700">
              You're already checked in to <span className="font-mono font-semibold">{mySeatId}</span>. Check out first before claiming another seat.
            </p>
          </div>
        )}

        {/* ── seat details card ────────────────────────────────────── */}
        <InfoCard seat={active} />

        {/* ── active session card ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isMine && (
            <motion.div
              key="session"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-xl border border-primary/15 bg-primary-soft/50 p-4"
            >
              <p className="text-[10.5px] font-semibold uppercase tracking-widest text-primary/80">
                Active Session
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Metric label="Study Duration" value={formatDuration(active.occupiedFor)} />
                <Metric
                  label="Away Remaining"
                  value={away ? formatDuration(active.awayRemaining) : "—"}
                  muted={!away}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── QR code for available selected seat ──────────────────── */}
        {canCheckIn && <SeatQR seatId={active.id} />}

        {/* ── issue picker ─────────────────────────────────────────── */}
        <AnimatePresence>
          {showIssuePicker && (
            <IssueTypePicker
              seatId={active.id}
              onClose={() => setShowIssuePicker(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── action buttons ───────────────────────────────────────── */}
      <div className="space-y-2 border-t border-border pt-4">
        {canCheckIn && (
          <Button className="w-full" variant="secondary"
            onClick={() => checkIn(active.id)}>
            <LogIn className="size-4" />
            Check in on this device
          </Button>
        )}

        {isMine && away && (
          <Button className="w-full" onClick={confirmPresence}>
            <Undo2 className="size-4" />
            I'm Back
          </Button>
        )}

        {isMine && !away && (
          <Button className="w-full" variant="soft" onClick={confirmPresence}>
            <CircleCheck className="size-4" />
            Confirm Presence
          </Button>
        )}

        {isMine && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={away} onClick={goAway}>
              <Coffee className="size-4" />
              Away
            </Button>
            <Button variant="secondary" onClick={checkOut}>
              <LogOut className="size-4" />
              Check Out
            </Button>
          </div>
        )}

        {!showIssuePicker && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-status-occupied"
            onClick={() => setShowIssuePicker(true)}
          >
            <Flag className="size-4" />
            Report an Issue
          </Button>
        )}
      </div>
    </div>
  );
}
