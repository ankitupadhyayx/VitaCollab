"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const shouldRetryQuery = (failureCount, error) => {
  const status = error?.response?.status;

  // Never retry rate-limited requests automatically.
  if (status === 429) {
    return false;
  }

  return failureCount < 1;
};

export function AppQueryProvider({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: shouldRetryQuery,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000)
          }
        }
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
