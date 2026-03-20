"use client";

import { useEffect } from "react";
import { getApiBaseUrl } from "@/services/api";
import { websocketService } from "@/services/websocket-service";

export function useRealtimeEvents(configs = []) {
  useEffect(() => {
    let apiBaseUrl = null;
    try {
      apiBaseUrl = getApiBaseUrl();
      websocketService.connect(apiBaseUrl);
    } catch {
      // API base URL is already validated elsewhere; fallback pollers still run.
    }

    const cleanup = [];
    configs.forEach((config) => {
      if (!config?.eventName || typeof config?.onEvent !== "function") {
        return;
      }

      cleanup.push(websocketService.subscribe(config.eventName, config.onEvent));

      if (typeof config.poller === "function") {
        cleanup.push(websocketService.registerFallback(config.eventName, config.poller, config.pollInterval || 15000));
      }
    });

    return () => {
      cleanup.forEach((fn) => fn?.());
    };
  }, [configs]);
}
