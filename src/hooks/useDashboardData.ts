import { useCallback, useEffect, useState } from "react";
import {
  api,
  type DashStats,
  type ZoneUtil,
  type RecentSession,
  type FlaggedSeat,
  type TrendPoint,
  type IssueRow,
} from "@/lib/api";
import { MOCK_DASHBOARD } from "@/lib/mockDashboard";

export interface DashboardData {
  stats: DashStats | null;
  zones: ZoneUtil[];
  sessions: RecentSession[];
  flagged: FlaggedSeat[];
  trends: TrendPoint[];
  issues: IssueRow[];
  loading: boolean;
  error: string | null;
}

const INITIAL: DashboardData = {
  ...MOCK_DASHBOARD,
  loading: true,
  error: null,
};

const POLL_MS = 10000;

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(INITIAL);

  const load = useCallback(async () => {
    try {
      const [stats, zones, sessions, flagged, trends, issues] = await Promise.all([
        api.stats(),
        api.zones(),
        api.recentSessions(8),
        api.flagged(),
        api.trends(12),
        api.issues("OPEN"),
      ]);
      setData({
        stats,
        zones,
        sessions,
        flagged,
        trends,
        issues,
        loading: false,
        error: null,
      });
    } catch {
      setData({ ...MOCK_DASHBOARD, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  return data;
}
