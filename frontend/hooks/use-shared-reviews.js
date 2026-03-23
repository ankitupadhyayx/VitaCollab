"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchApprovedReviews, fetchMyReviews } from "@/services/review.service";

const normalizePublicParams = (params = {}) => {
  const entries = Object.entries(params || {})
    .filter(([, value]) => typeof value !== "undefined" && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(entries);
};

export function useSharedPublicReviews(params = {}, options = {}) {
  const {
    enabled = true,
    staleTime = 60 * 1000,
    maxItems
  } = options;

  const queryClient = useQueryClient();
  const normalizedParams = useMemo(() => normalizePublicParams(params), [params]);
  const queryKey = useMemo(
    () => queryKeys.publicReviews(normalizedParams),
    [normalizedParams]
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchApprovedReviews(normalizedParams),
    enabled,
    staleTime
  });

  const reviews = useMemo(() => {
    const list = data?.data?.reviews || [];
    if (typeof maxItems === "number") {
      return list.slice(0, Math.max(0, maxItems));
    }
    return list;
  }, [data, maxItems]);

  const setReviews = (updater) => {
    queryClient.setQueryData(queryKey, (previous) => {
      const previousReviews = previous?.data?.reviews || [];
      const nextReviews =
        typeof updater === "function"
          ? updater(previousReviews)
          : Array.isArray(updater)
            ? updater
            : previousReviews;

      return {
        ...(previous || {}),
        data: {
          ...(previous?.data || {}),
          reviews: nextReviews
        }
      };
    });
  };

  return {
    reviews,
    isLoading,
    isFetching,
    error,
    refetch,
    setReviews
  };
}

export function useSharedMyReviews(options = {}) {
  const {
    enabled = true,
    staleTime = 60 * 1000,
    maxItems
  } = options;

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.myReviews,
    queryFn: fetchMyReviews,
    enabled,
    staleTime
  });

  const reviews = useMemo(() => {
    const list = data?.data?.reviews || [];
    if (typeof maxItems === "number") {
      return list.slice(0, Math.max(0, maxItems));
    }
    return list;
  }, [data, maxItems]);

  const setReviews = (updater) => {
    queryClient.setQueryData(queryKeys.myReviews, (previous) => {
      const previousReviews = previous?.data?.reviews || [];
      const nextReviews =
        typeof updater === "function"
          ? updater(previousReviews)
          : Array.isArray(updater)
            ? updater
            : previousReviews;

      return {
        ...(previous || {}),
        data: {
          ...(previous?.data || {}),
          reviews: nextReviews
        }
      };
    });
  };

  return {
    reviews,
    isLoading,
    isFetching,
    error,
    refetch,
    setReviews
  };
}
