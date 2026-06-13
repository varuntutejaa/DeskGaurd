import { useEffect, useState, useCallback } from "react";
import { Wrench, X, Clock, MapPin, ChevronRight, RefreshCw } from "lucide-react";
import { Panel } from "./Panel";
import { Button } from "@/components/ui/button";
import { api, type IssueRow } from "@/lib/api";

const ISSUE_LABEL: Record<string, string> = {
  CHAIR_BROKEN:          "Chair Broken",
  DIRTY_SPACE:           "Dirty Space",
  CHARGING_NOT_WORKING:  "Charging Socket Not Working",
  OTHER:                 "Other",
};

export function IssueApprovals() {
  const [issues, setIssues]   = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await api.issues("PENDING_APPROVAL");
      setIssues(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await api.approveIssue(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ } finally { setBusy(null); }
  };

  const dismiss = async (id: string) => {
    setBusy(id);
    try {
      await api.dismissIssue(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ } finally { setBusy(null); }
  };

  const pending = issues.length;

  return (
    <Panel
      title="Issue Approvals"
      subtitle={loading ? "Loading…" : pending === 0 ? "No pending reports" : `${pending} pending report${pending !== 1 ? "s" : ""}`}
      action={
        <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
          <Wrench className="size-8 opacity-30" />
          <p className="text-[13px]">All clear — no pending issue reports.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-amber-200 bg-amber-50/60 p-4"
            >
              {/* header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
                      {issue.seatNumber}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      {ISSUE_LABEL[issue.issueType] ?? issue.issueType}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {issue.zone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(issue.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {issue.description && (
                    <p className="mt-1.5 text-[12px] text-muted-foreground">
                      {issue.description}
                    </p>
                  )}
                </div>
              </div>

              {/* action buttons */}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  className="flex-1"
                  disabled={busy === issue.id}
                  onClick={() => approve(issue.id)}
                >
                  <Wrench className="size-3.5" />
                  Mark as Maintenance
                  <ChevronRight className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy === issue.id}
                  onClick={() => dismiss(issue.id)}
                >
                  <X className="size-3.5" />
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
