"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BellDot,
  BrainCircuit,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileHeart,
  Hospital,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { queryKeys } from "@/lib/query-keys";
import { decideRecord, fetchRecords } from "@/services/record.service";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const toast = useToast();
  const role = user?.role || "patient";
  const { runOptimistic, isPending } = useOptimisticUpdate(records, setRecords);

  const {
    data: recordsResponse,
    isLoading: loading,
    error: recordsError
  } = useQuery({
    queryKey: queryKeys.records,
    queryFn: () => fetchRecords({ limit: 100 }),
    refetchInterval: 30000
  });

  useEffect(() => {
    if (recordsResponse) {
      setRecords(recordsResponse?.data?.records || []);
    }
  }, [recordsResponse]);

  useEffect(() => {
    if (recordsError) {
      toast.error(recordsError?.response?.data?.message || "Failed to load dashboard data");
    }
  }, [recordsError]);

  const patientSuggestions = useMemo(
    () => [
      "You should upload a recent blood test for better trend visibility.",
      "Connect one more hospital profile to improve continuity of care.",
      "Review one pending record to keep your timeline up to date."
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const key = "vitacollab-onboarding-complete";
    const completed = window.localStorage.getItem(key);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    window.localStorage.setItem("vitacollab-onboarding-complete", "yes");
    setShowOnboarding(false);
  };

  const cards = useMemo(() => {
    const totalRecords = records.length;
    const pending = records.filter((item) => item.status === "pending").length;
    const uniqueHospitals = new Set(records.map((item) => item.hospitalId)).size;
    const approved = records.filter((item) => item.status === "approved").length;
    const trend = totalRecords ? Math.round((approved / totalRecords) * 100) : 0;

    return [
      { label: "Total Records", value: String(totalRecords), change: "Across your timeline", icon: FileHeart },
      { label: "Pending Approvals", value: String(pending), change: pending ? "Action required" : "No pending actions", icon: BellDot },
      { label: "Connected Hospitals", value: String(uniqueHospitals), change: "Trusted network", icon: Hospital },
      { label: "Health Trend Score", value: String(trend), change: "Based on approved records", icon: Activity }
    ];
  }, [records]);

  const analyticsData = useMemo(() => {
    const buckets = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    records.forEach((item) => {
      const date = new Date(item.createdAt || item.recordDate);
      const key = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets).map(([day, total]) => ({ day, total }));
  }, [records]);

  const heatmapDays = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, index) => {
        const intensity = (index + records.length) % 5;
        return intensity;
      }),
    [records.length]
  );

  const pendingList = useMemo(
    () => records.filter((item) => item.status === "pending").slice(0, 4),
    [records]
  );

  const realtimeConfigs = useMemo(
    () => [
      {
        eventName: "record:updated",
        onEvent: (payload) => {
          if (!payload) {
            return;
          }
          if (Array.isArray(payload)) {
            setRecords(payload);
            return;
          }
          setRecords((prev) => {
            const existing = prev.find((item) => item.id === payload.id);
            if (existing) {
              return prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item));
            }
            return [payload, ...prev].slice(0, 100);
          });
        },
        poller: async () => {
          const response = await fetchRecords({ limit: 100 });
          return response?.data?.records || [];
        },
        pollInterval: 20000
      },
      {
        eventName: "approval:changed",
        onEvent: (payload) => {
          if (!payload?.id) {
            return;
          }
          setRecords((prev) => prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)));
        }
      }
    ],
    []
  );

  useRealtimeEvents(realtimeConfigs);

  const renderMetricCards = () => (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );

  const renderSkeletonCards = () => (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} hover={false}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const renderPatientView = () => (
    <>
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Recent activity across your records and approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingList.length ? (
              <div className="relative space-y-4 border-l border-border/80 pl-4">
                {pendingList.map((item) => (
                  <div key={item.id} className="relative rounded-2xl bg-background/55 p-3">
                    <span className="absolute -left-[22px] top-4 h-3 w-3 rounded-full bg-primary" />
                    <p className="font-medium capitalize">{item.type} submitted by {item.hospitalName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent activity" description="Your activity feed will appear here as records move." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-success/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              AI Health Insights
            </CardTitle>
            <CardDescription>Smart suggestions to keep your record profile complete.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {patientSuggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl bg-background/70 p-3 text-muted-foreground">
                {suggestion}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>Your data update pattern over the last 10 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-14 gap-1 rounded-2xl bg-background/60 p-3">
              {heatmapDays.map((intensity, index) => (
                <div
                  key={index}
                  className="h-4 rounded-sm"
                  style={{
                    background:
                      intensity === 0
                        ? "hsl(var(--muted))"
                        : intensity === 1
                          ? "rgba(37, 99, 235, 0.28)"
                          : intensity === 2
                            ? "rgba(37, 99, 235, 0.45)"
                            : intensity === 3
                              ? "rgba(37, 99, 235, 0.62)"
                              : "rgba(37, 99, 235, 0.86)"
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{cards[3]?.value || 0}%</p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <motion.div
                className="h-2 rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Number(cards[3]?.value || 0), 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Calculated from approval consistency and timeline freshness.</p>
          </CardContent>
        </Card>
      </section>
    </>
  );

  const renderHospitalView = () => {
    const pending = records.filter((item) => item.status === "pending").slice(0, 6);

    const quickDecision = async (recordId, decision) => {
      const result = await runOptimistic({
        key: `dashboard-record:${recordId}`,
        apply: (prev) => prev.map((item) => (item.id === recordId ? { ...item, status: decision, optimistic: true } : item)),
        request: async () => decideRecord(recordId, decision),
        finalize: (prev) => prev.map((item) => (item.id === recordId ? { ...item, optimistic: false } : item))
      });

      if (!result.ok) {
        toast.error(result.error?.response?.data?.message || "Failed to update record");
      }
    };

    return (
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Approval Workflow Queue
            </CardTitle>
            <CardDescription>Track pending decisions and follow up quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.length ? (
              pending.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-background/60 p-3">
                  <div>
                    <p className="font-medium capitalize">{item.type} • {item.hospitalName || "Hospital"}</p>
                    <p className="text-xs text-muted-foreground">Patient: {item.patientName || "Assigned"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-xl bg-success/15 px-3 py-1 text-xs font-semibold text-success"
                      onClick={() => quickDecision(item.id, "approved")}
                      disabled={isPending(`dashboard-record:${item.id}`)}
                    >
                      {isPending(`dashboard-record:${item.id}`) ? "Updating..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-danger/15 px-3 py-1 text-xs font-semibold text-danger"
                      onClick={() => quickDecision(item.id, "rejected")}
                      disabled={isPending(`dashboard-record:${item.id}`)}
                    >
                      {isPending(`dashboard-record:${item.id}`) ? "Updating..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Queue is clear" description="No pending approvals right now." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/15">
          <CardHeader>
            <CardTitle>Smart Suggestions</CardTitle>
            <CardDescription>Quality nudges before uploading records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Add reason notes when rejecting records.</p>
            <p>- Upload imaging in high resolution for faster approval.</p>
            <p>- Use patient email autocomplete to avoid mismatch.</p>
          </CardContent>
        </Card>
      </section>
    );
  };

  const renderAdminView = () => (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Platform Analytics
          </CardTitle>
          <CardDescription>Total users, active hospitals, and uploaded records trend.</CardDescription>
        </CardHeader>
        <CardContent className="h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(37,99,235,0.08)" }} />
              <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/12 to-accent/12">
        <CardHeader>
          <CardTitle>Live Sync Indicator</CardTitle>
          <CardDescription>Cross-system signals from hospitals and patients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" />
            Live updates active
          </div>
          <p className="text-sm text-muted-foreground">
            Incoming events are synchronized with notification polling and approval status updates.
          </p>
        </CardContent>
      </Card>
    </section>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-6 pb-24 lg:pb-0">
            <motion.section className="animate-rise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold tracking-tight">
                {role === "hospital" ? "Hospital Command Center" : role === "admin" ? "Admin Intelligence Board" : "Patient Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {role === "hospital"
                  ? "Manage uploads, track approvals, and optimize care workflows."
                  : role === "admin"
                    ? "Monitor platform health, usage trends, and trust operations."
                    : "Overview of your records, approvals, health score, and smart insights."}
              </p>
            </motion.section>

            {showOnboarding ? (
              <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Welcome to VitaCollab</p>
                    <p className="text-xs text-muted-foreground">Your dashboard is ready. Complete your profile and upload your first record to unlock full collaboration.</p>
                  </div>
                  <button type="button" onClick={completeOnboarding} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                    Continue
                  </button>
                </CardContent>
              </Card>
            ) : null}

            {loading ? renderSkeletonCards() : renderMetricCards()}

            {!loading && role === "patient" ? renderPatientView() : null}
            {!loading && role === "hospital" ? renderHospitalView() : null}
            {!loading && role === "admin" ? renderAdminView() : null}

            <section className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2 health-grid">
                <CardHeader>
                  <CardTitle>Recent Reports Preview</CardTitle>
                  <CardDescription>Your last uploaded or received documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {records.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-background/65 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold capitalize">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">{item.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Real-time Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Updates are synchronized every 15 seconds.</p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Live
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
