import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Map,
  Armchair,
  UserCheck,
  Coffee,
  Flag,
  Wrench,
  Activity,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/dashboard/Panel";
import { OccupancyTrendChart } from "@/components/dashboard/OccupancyTrendChart";
import { ZoneUtilizationChart } from "@/components/dashboard/ZoneUtilizationChart";
import { IssueReportsChart } from "@/components/dashboard/IssueReportsChart";
import { DataTables } from "@/components/dashboard/DataTables";
import { StudentManagement } from "@/components/dashboard/StudentManagement";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden font-mono text-[13px] tabular-nums text-muted-foreground sm:inline">
      {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

export function DashboardPage() {
  const { stats, zones, sessions, flagged, trends, issues, loading, error } =
    useDashboardData();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* header */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back home"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="h-5 w-px bg-border" />
          <Link to="/" aria-label="DeskGuard home">
            <Logo />
          </Link>
          <span className="hidden items-center gap-2 md:flex">
            <span className="h-5 w-px bg-border" />
            <span className="text-sm font-medium tracking-tight">
              Librarian Dashboard
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-[12px] font-medium text-status-available sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-available opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-available" />
            </span>
            Live
          </span>
          <Clock />
          <Button variant="secondary" size="sm" asChild>
            <Link to="/library">
              <Map className="size-4" />
              <span className="hidden sm:inline">Live Map</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* scrollable content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] space-y-5 p-4 sm:p-6">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time seat occupancy and activity across the Main Library.
            </p>
          </div>

          {error && !stats ? (
            <div className="rounded-2xl border border-status-occupied/20 bg-status-occupied/5 p-5 text-sm text-status-occupied">
              {error} — is the backend running on :4000?
            </div>
          ) : loading && !stats ? (
            <LoadingState />
          ) : stats ? (
            <>
              {/* stat cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <StatCard index={0} label="Total Seats" value={stats.total} icon={Armchair} accent="hsl(160 14% 30%)" />
                <StatCard index={1} label="Occupied" value={stats.occupied} icon={UserCheck} accent="hsl(var(--st-occupied))" />
                <StatCard index={2} label="Away" value={stats.away} icon={Coffee} accent="hsl(var(--st-away))" />
                <StatCard index={3} label="Abandoned" value={stats.abandoned} icon={Flag} accent="hsl(var(--st-abandoned))" />
                <StatCard index={4} label="Maintenance" value={stats.maintenance} icon={Wrench} accent="hsl(var(--st-maintenance))" />
                <StatCard index={5} label="Occupancy" value={stats.occupancyPct} suffix="%" icon={Activity} accent="hsl(var(--primary))" hint={`${stats.activeSessions} active sessions`} />
              </div>

              {/* charts */}
              <div className="grid gap-5 lg:grid-cols-3">
                <Panel
                  title="Occupancy Trends"
                  subtitle="Seats in use over the last 12 hours"
                  className="lg:col-span-2"
                >
                  <OccupancyTrendChart data={trends} />
                </Panel>
                <Panel
                  title="Issue Reports"
                  subtitle={`${stats.openIssues} open`}
                >
                  <IssueReportsChart issues={issues} />
                </Panel>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <Panel
                  title="Zone Utilization"
                  subtitle="Occupancy by area"
                  className="lg:col-span-1"
                >
                  <ZoneUtilizationChart data={zones} />
                </Panel>
                <div className="lg:col-span-2">
                  <DataTables sessions={sessions} issues={issues} flagged={flagged} />
                </div>
              </div>

              <StudentManagement />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[136px] rounded-2xl border border-border bg-surface p-5">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton mt-4 h-3 w-20" />
            <div className="skeleton mt-2 h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="skeleton h-[320px] rounded-2xl lg:col-span-2" />
        <div className="skeleton h-[320px] rounded-2xl" />
      </div>
    </div>
  );
}
