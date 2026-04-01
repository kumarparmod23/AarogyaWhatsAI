"use client";

import { useEffect, useRef } from "react";

/**
 * Poll a callback at a given interval. Automatically cleans up on unmount.
 * Skips the tick if the previous call is still in-flight.
 */
export function usePolling(callback: () => Promise<void> | void, intervalMs: number, enabled = true) {
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await callback();
      } finally {
        inFlight.current = false;
      }
    };

    tick(); // initial fetch
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [callback, intervalMs, enabled]);
}
