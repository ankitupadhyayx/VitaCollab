"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";
import { fetchMyNotifications, markNotificationRead } from "@/services/notification.service";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("unread");
  const [category, setCategory] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const toast = useToast();
  const { isPending, runOptimistic } = useOptimisticUpdate(notifications, setNotifications);

  const {
    data: notificationsResponse,
    isLoading: loading,
    error: notificationsError
  } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchMyNotifications,
    refetchInterval: 30000
  });

  useEffect(() => {
    if (notificationsResponse) {
      setNotifications(notificationsResponse?.data?.notifications || []);
    }
  }, [notificationsResponse]);

  useEffect(() => {
    if (notificationsError) {
      toast.error(notificationsError?.response?.data?.message || "Failed to fetch notifications");
    }
  }, [notificationsError]);

  const realtimeConfigs = useMemo(
    () => [
      {
        eventName: "notification:new",
        onEvent: (payload) => {
          if (!payload) {
            return;
          }
          if (Array.isArray(payload)) {
            setNotifications(payload);
            return;
          }
          setNotifications((prev) => [payload, ...prev].slice(0, 50));
        },
        poller: async () => {
          const response = await fetchMyNotifications();
          return response?.data?.notifications || [];
        },
        pollInterval: 15000
      }
    ],
    []
  );

  useRealtimeEvents(realtimeConfigs);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === "all") {
        return category === "all" ? true : item.type?.includes(category);
      }
      if (item.isRead) {
        return false;
      }
      return category === "all" ? true : item.type?.includes(category);
    });
  }, [activeTab, category, notifications]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter((item) => !item.isRead).map((item) => item.id);
    if (!unreadIds.length) {
      return;
    }

    const result = await runOptimistic({
      key: "notifications:mark-all",
      apply: (prev) => prev.map((item) => ({ ...item, isRead: true })),
      request: async () => Promise.all(unreadIds.map((id) => markNotificationRead(id)))
    });

    if (result.ok) {
      toast.success("All notifications marked as read");
    } else {
      toast.error(result.error?.response?.data?.message || "Failed to mark all notifications");
    }
  };

  const markRead = async (id) => {
    const result = await runOptimistic({
      key: `notification:${id}`,
      apply: (prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      request: async () => markNotificationRead(id)
    });

    if (!result.ok) {
      toast.error(result.error?.response?.data?.message || "Failed to update notification");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-4">
            <header>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-sm text-muted-foreground">Approval requests and care reminders.</p>
            </header>

            <section className="flex items-center justify-between rounded-2xl border border-border bg-card/70 p-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${activeTab === "unread" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setActiveTab("unread")}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${activeTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setActiveTab("all")}
                >
                  All ({notifications.length})
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="all">All categories</option>
                  <option value="system">System</option>
                  <option value="record">Records</option>
                  <option value="approval">Approvals</option>
                </select>
                <button type="button" className="text-xs font-semibold text-primary" onClick={markAllRead}>Mark all read</button>
              </div>
            </section>

            {loading ? <Loader /> : null}

            {!loading && visibleNotifications.length ? (
              visibleNotifications.map((item) => (
                <div key={item.id} className="relative overflow-hidden rounded-2xl">
                  {!item.isRead ? (
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-28 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                      Swipe to read
                    </div>
                  ) : null}
                  <motion.div
                    drag={item.isRead ? false : "x"}
                    dragConstraints={{ left: -96, right: 0 }}
                    dragElastic={0.08}
                    onDragEnd={(_, info) => {
                      if (!item.isRead && info.offset.x < -70) {
                        markRead(item.id);
                      }
                    }}
                    className="relative z-10"
                  >
                    <Card className="animate-rise">
                      <CardHeader>
                        <CardTitle className="text-base capitalize">{item.type.replaceAll("_", " ")}</CardTitle>
                        <CardDescription>{new Date(item.createdAt).toLocaleString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                        {!item.isRead ? (
                          <button
                            className="mt-3 text-xs font-semibold text-primary"
                            onClick={() => markRead(item.id)}
                            disabled={isPending(`notification:${item.id}`)}
                          >
                            {isPending(`notification:${item.id}`) ? "Updating..." : "Mark as read"}
                          </button>
                        ) : null}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              ))
            ) : null}

            {!loading && !visibleNotifications.length ? (
              <EmptyState variant="notifications" />
            ) : null}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
