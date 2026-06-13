import { useEffect } from "react";
import { useLibrary } from "@/features/seats/store";

const POLL_MS = 3000; // refetch seats from backend
const CLOCK_MS = 1000; // recompute live durations between fetches

/**
 * Connects the map to the backend: initial load, periodic polling for
 * realtime seat changes (other users + cron sweeps), and a 1s clock that
 * advances session timers locally without spamming the network.
 */
export function useLibraryData() {
  const fetchSeats = useLibrary((s) => s.fetchSeats);
  const recompute = useLibrary((s) => s.recompute);

  useEffect(() => {
    fetchSeats();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const poll = setInterval(fetchSeats, POLL_MS);
    const clock = reduce ? null : setInterval(recompute, CLOCK_MS);

    const onFocus = () => fetchSeats();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(poll);
      if (clock) clearInterval(clock);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchSeats, recompute]);
}
