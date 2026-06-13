import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  LogOut,
  Coffee,
  Undo2,
  CircleCheck,
  Check,
  MapPin,
  Zap,
  Armchair,
  TriangleAlert,
  ShieldCheck,
  LockKeyhole,
  BadgeCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { useAuth } from "@/lib/auth";
import { api, type ApiSeat } from "@/lib/api";
import {
  SEAT_TYPE_LABEL,
  STATUS_META,
  ZONE_LABEL,
  type SeatStatus,
  type SeatType,
  type ZoneId,
} from "@/features/seats/types";
import { formatDuration } from "@/lib/utils";

const STATUS_MAP: Record<ApiSeat["status"], SeatStatus> = {
  FREE: "available",
  OCCUPIED: "occupied",
  AWAY: "away",
  ABANDONED: "abandoned",
  MAINTENANCE: "maintenance",
};
const TYPE_MAP: Record<ApiSeat["seatType"], SeatType> = {
  CUBICLE: "cubicle",
  OPEN: "open-desk",
  SILENT: "open-desk",
  DISCUSSION: "discussion",
};

type Phase = "loading" | "ready" | "active" | "error";

export function CheckInPage() {
  const { seatId = "" } = useParams();
  const user = useAuth();
  const [seat, setSeat] = useState<ApiSeat | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Prevent occupying multiple seats
  const existingSeatId = (() => {
    try { return localStorage.getItem("deskguard.mySeat"); } catch { return null; }
  })();
  const alreadyHasSeat = !!existingSeatId && existingSeatId !== seatId;

  const status: SeatStatus = seat ? STATUS_MAP[seat.status] : "available";
  const away = status === "away";

  // load the seat
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await api.getSeats();
        const found = all.find((s) => s.seatNumber === seatId) ?? null;
        if (cancelled) return;
        if (!found) {
          setError(`Seat ${seatId} was not found.`);
          setPhase("error");
          return;
        }
        setSeat(found);
        // Always start on the seat overview. Session controls only appear
        // after *this* device checks in — a scanner of an occupied seat
        // sees the "unavailable" state, never someone else's session.
        setPhase("ready");
      } catch {
        if (!cancelled) {
          setError("Couldn't reach the library. Check your connection.");
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seatId]);

  // live study timer while active
  useEffect(() => {
    if (phase !== "active" || !seat?.activeSession) return;
    const start = new Date(seat.activeSession.checkedInAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, seat]);

  const run = async (fn: () => Promise<ApiSeat | unknown>, nextPhase?: Phase) => {
    setBusy(true);
    setError(null);
    try {
      const updated = (await fn()) as ApiSeat;
      setSeat(updated);
      if (nextPhase) setPhase(nextPhase);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-radial-emerald" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="glass rounded-2xl p-6 shadow-pop">
          {phase === "loading" && (
            <div className="space-y-4">
              <div className="skeleton h-6 w-24" />
              <div className="skeleton h-16 w-full" />
              <div className="skeleton h-11 w-full" />
            </div>
          )}

          {phase === "error" && (
            <div className="py-4 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-status-occupied/10 text-status-occupied">
                <TriangleAlert className="size-6" />
              </span>
              <p className="mt-4 font-medium tracking-tight">Can't check in</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <Button variant="secondary" className="mt-5" asChild>
                <Link to="/library">View live map</Link>
              </Button>
            </div>
          )}

          {seat && phase !== "loading" && phase !== "error" && (
            <>
              {/* seat header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Library Seat
                </span>
                <StatusBadge status={status} />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Armchair className="size-6" />
                </span>
                <div>
                  <p className="font-display text-3xl font-semibold tracking-tight">
                    {seat.seatNumber}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {SEAT_TYPE_LABEL[TYPE_MAP[seat.seatType]]}
                  </p>
                </div>
              </div>

              {/* info */}
              <div className="mt-4 space-y-2.5 rounded-xl border border-border bg-background/60 p-4 text-[13px]">
                <Row icon={MapPin} label="Zone" value={ZONE_LABEL[seat.zone as ZoneId] ?? seat.zone} />
                <Row
                  icon={Zap}
                  label="Charging port"
                  value={seat.hasChargingPort ? "Available" : "Not available"}
                  accent={seat.hasChargingPort}
                />
              </div>

              {/* signed-in identity (verification) */}
              {user && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-status-available/10 px-3 py-2 text-[12px] font-medium text-[hsl(152_45%_30%)]">
                  <BadgeCheck className="size-4 shrink-0 text-status-available" />
                  Verified as {user.email}
                </div>
              )}

              {/* READY → requires sign-in + an unoccupied seat */}
              {phase === "ready" && status === "available" && (
                alreadyHasSeat ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-[13px]">
                    <p className="font-semibold text-amber-800">You already have a seat</p>
                    <p className="mt-1 text-amber-700">
                      You're checked in to{" "}
                      <span className="font-mono font-semibold">{existingSeatId}</span>.
                      Check out of your current seat before claiming a new one.
                    </p>
                    <Button variant="secondary" className="mt-3 w-full" asChild>
                      <Link to="/library">Go to live map</Link>
                    </Button>
                  </div>
                ) : user ? (
                  <Button
                    className="mt-4 w-full"
                    size="lg"
                    disabled={busy}
                    onClick={() => run(() => api.checkIn(seat.seatNumber), "active")}
                  >
                    <LogIn className="size-4" />
                    Check in to {seat.seatNumber}
                  </Button>
                ) : (
                  <SignInGate seatId={seat.seatNumber} />
                )
              )}

              {phase === "ready" && status !== "available" && (
                <div className="mt-5 rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
                  This seat is currently <b>{STATUS_META[status].label.toLowerCase()}</b> and can't be claimed.
                </div>
              )}

              {/* ACTIVE → session controls */}
              <AnimatePresence>
                {phase === "active" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5"
                  >
                    <div className="flex items-center gap-2 rounded-xl bg-primary-soft/60 p-3 text-primary">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Check className="size-4" />
                      </motion.span>
                      <div>
                        <p className="text-[13px] font-semibold leading-tight">
                          {away ? "On a break" : "You're checked in"}
                        </p>
                        <p className="font-mono text-xs tabular-nums">
                          {formatDuration(elapsed)} studied
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {away ? (
                        <Button
                          className="w-full"
                          disabled={busy}
                          onClick={() => run(() => api.confirm(seat.seatNumber))}
                        >
                          <Undo2 className="size-4" />
                          I'm back
                        </Button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="soft"
                            disabled={busy}
                            onClick={() => run(() => api.confirm(seat.seatNumber))}
                          >
                            <CircleCheck className="size-4" />
                            Confirm
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={busy}
                            onClick={() => run(() => api.away(seat.seatNumber))}
                          >
                            <Coffee className="size-4" />
                            Away
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        disabled={busy}
                        onClick={() => run(() => api.checkOut(seat.seatNumber), "ready")}
                      >
                        <LogOut className="size-4" />
                        Check out
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="mt-3 text-center text-[13px] text-status-occupied">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Powered by <span className="font-medium text-foreground">DeskGuard</span> ·{" "}
          <Link to="/library" className="text-primary hover:underline">
            View live map
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignInGate({ seatId }: { seatId: string }) {
  const redirect = encodeURIComponent(`/checkin/${seatId}`);
  return (
    <div className="mt-4 rounded-xl border border-primary/15 bg-primary-soft/40 p-4 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary ring-1 ring-primary/10">
        <LockKeyhole className="size-5" />
      </span>
      <p className="mt-3 text-sm font-semibold tracking-tight">Sign in to check in</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        Claiming a seat requires your{" "}
        <span className="font-medium text-foreground">@muj.manipal.edu</span> account
        on this device.
      </p>
      <Button className="mt-4 w-full" asChild>
        <Link to={`/login/student?redirect=${redirect}`}>
          <ShieldCheck className="size-4" />
          Sign in to continue
        </Link>
      </Button>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className={accent ? "font-medium text-primary" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}
