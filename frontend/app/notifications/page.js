"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useSharedNotifications } from "@/hooks/use-shared-notifications";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("unread");
  const [category, setCategory] = useState("all");
  const toast = useToast();
  const {
    notifications,
    unreadCount,
    isLoading: loading,
    error: notificationsError,
    setNotifications,
    markRead,
    markAllRead
  } = useSharedNotifications({
    refetchInterval: 60000,
    refetchIntervalInBackground: false
  });

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
        }
      }
    ],
    []
  );

  useRealtimeEvents(realtimeConfigs);

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

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to mark all notifications");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update notification");
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
                <button type="button" className="text-xs font-semibold text-primary" onClick={handleMarkAllRead}>Mark all read</button>
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
                        handleMarkRead(item.id);
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
                            onClick={() => handleMarkRead(item.id)}
                          >
                            Mark as read
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
