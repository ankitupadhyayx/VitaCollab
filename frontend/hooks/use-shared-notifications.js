"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchMyNotifications, markNotificationRead } from "@/services/notification.service";

export function useSharedNotifications(options = {}) {
  const {
    enabled = true,
    refetchInterval = 60000,
    refetchIntervalInBackground = false,
    maxItems
  } = options;

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchMyNotifications,
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
    refetchIntervalInBackground
  });

  const notifications = useMemo(() => {
    const list = data?.data?.notifications || [];
    if (typeof maxItems === "number") {
      return list.slice(0, Math.max(0, maxItems));
    }
    return list;
  }, [data, maxItems]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const setNotifications = (updater) => {
    queryClient.setQueryData(queryKeys.notifications, (previous) => {
      const previousNotifications = previous?.data?.notifications || [];
      const nextNotifications =
        typeof updater === "function"
          ? updater(previousNotifications)
          : Array.isArray(updater)
            ? updater
            : previousNotifications;

      return {
        ...(previous || {}),
        data: {
          ...(previous?.data || {}),
          notifications: nextNotifications
        }
      };
    });
  };

  const markRead = async (id) => {
    if (!id) {
      return;
    }

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );

    try {
      await markNotificationRead(id);
    } catch (error) {
      // Re-sync from server if optimistic update fails.
      await refetch();
      throw error;
    }
  };

  const markAllRead = async () => {
    const ids = notifications.filter((item) => !item.isRead).map((item) => item.id);
    if (!ids.length) {
      return;
    }

    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));

    try {
      await Promise.all(ids.map((id) => markNotificationRead(id)));
    } catch (error) {
      await refetch();
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    error,
    refetch,
    setNotifications,
    markRead,
    markAllRead
  };
}
