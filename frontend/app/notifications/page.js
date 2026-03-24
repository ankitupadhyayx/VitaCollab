"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
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
  }, [notificationsError, toast]);

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
        <div className="app-page-shell">
          <Sidebar />
          <main className="w-full space-y-4 pb-28 lg:pb-0">
            <header>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
              <p className="text-sm text-muted-foreground">Approval requests and care reminders.</p>
            </header>

            <section className="rounded-2xl border border-border bg-card/70 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${activeTab === "unread" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setActiveTab("unread")}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${activeTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setActiveTab("all")}
                >
                  All ({notifications.length})
                </button>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-auto"
                  >
                    <option value="all">All categories</option>
                    <option value="system">System</option>
                    <option value="record">Records</option>
                    <option value="approval">Approvals</option>
                  </select>
                  <button type="button" className="min-h-[44px] whitespace-nowrap px-2 text-xs font-semibold text-primary" onClick={handleMarkAllRead}>Mark all read</button>
                </div>
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
