"use client";

import { useCallback, useRef, useState } from "react";

export function useOptimisticUpdate(state, setState) {
  const [pendingKeys, setPendingKeys] = useState({});
  const snapshotsRef = useRef({});

  const runOptimistic = useCallback(
    async ({ key, apply, request, rollback, finalize }) => {
      const snapshot = state;
      snapshotsRef.current[key] = snapshot;
      setPendingKeys((prev) => ({ ...prev, [key]: true }));
      setState((prev) => apply(prev));

      try {
        const result = await request();
        if (typeof finalize === "function") {
          setState((prev) => finalize(prev, result));
        }
        return { ok: true, result };
      } catch (error) {
        if (typeof rollback === "function") {
          setState((prev) => rollback(prev, snapshotsRef.current[key], error));
        } else {
          setState(snapshotsRef.current[key]);
        }
        return { ok: false, error };
      } finally {
        setPendingKeys((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete snapshotsRef.current[key];
      }
    },
    [setState, state]
  );

  return {
    runOptimistic,
    isPending: (key) => Boolean(pendingKeys[key])
  };
}
