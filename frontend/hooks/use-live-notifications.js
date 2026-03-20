"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLiveNotifications(fetcher, options = {}) {
  const { pollInterval = 15000, onError } = options;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef(fetcher);

  useEffect(() => {
    fetchRef.current = fetcher;
  }, [fetcher]);

  const refresh = useCallback(async (silent = false) => {
    try {
      const response = await fetchRef.current();
      setItems(response?.data?.notifications || []);
    } catch (error) {
      if (!silent && typeof onError === "function") {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    let mounted = true;

    const run = async (silent = false) => {
      if (!mounted) {
        return;
      }
      await refresh(silent);
    };

    run(false);
    const interval = setInterval(() => {
      run(true);
    }, pollInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollInterval, refresh]);

  return {
    items,
    setItems,
    loading,
    refresh
  };
}
