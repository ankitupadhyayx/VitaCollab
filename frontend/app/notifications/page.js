"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { fetchMyNotifications, markNotificationRead } from "@/services/notification.service";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");
  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    const run = async (silent = false) => {
      try {
        const response = await fetchMyNotifications();
        if (mounted) {
          setNotifications(response?.data?.notifications || []);
        }
      } catch (error) {
        if (!silent) {
          toast.error(error?.response?.data?.message || "Failed to fetch notifications");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();
    const interval = setInterval(() => run(true), 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const visibleNotifications = notifications.filter((item) => {
    if (activeTab === "all") {
      return true;
    }
    return !item.isRead;
  });

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
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
              <span className="text-xs text-muted-foreground">Auto-refresh every 15s</span>
            </section>

            {loading ? <Loader /> : null}

            {!loading && visibleNotifications.length ? (
              visibleNotifications.map((item) => (
                <Card key={item.id} className="animate-rise">
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{item.type.replaceAll("_", " ")}</CardTitle>
                    <CardDescription>{new Date(item.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                    {!item.isRead ? (
                      <button className="mt-3 text-xs font-semibold text-primary" onClick={() => markRead(item.id)}>
                        Mark as read
                      </button>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            ) : null}

            {!loading && !visibleNotifications.length ? (
              <EmptyState title="All clear" description="No new notifications right now." />
            ) : null}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
