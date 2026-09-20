import { useEffect, useCallback } from "react";
import { syncWithCloudflareSilently } from "../data/store";

/**
 * Hook to automatically synchronize data with Cloudflare Worker Backend in the background.
 * Triggers on initial mount, window focus, visibility change, and every 60 seconds.
 */
export function useAutoDataSync(pollingIntervalMs: number = 60000) {
  const sync = useCallback(() => {
    syncWithCloudflareSilently();
  }, []);

  useEffect(() => {
    // 1. Initial silent background sync on mount
    sync();

    // 2. Sync on tab focus / visibility change (e.g., user returns to the tab)
    const handleFocus = () => {
      sync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Periodic background sync
    let intervalId: number | undefined;
    if (pollingIntervalMs > 0) {
      intervalId = window.setInterval(sync, pollingIntervalMs);
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sync, pollingIntervalMs]);

  return { triggerSync: sync };
}
