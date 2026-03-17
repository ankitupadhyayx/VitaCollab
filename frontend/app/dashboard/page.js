"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BellDot, FileHeart, Hospital } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRecords } from "@/services/record.service";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetchRecords({ limit: 100 });
        setRecords(response?.data?.records || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

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

  const pendingList = useMemo(
    () => records.filter((item) => item.status === "pending").slice(0, 4),
    [records]
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-6">
            <section className="animate-rise">
              <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
              <p className="text-sm text-muted-foreground">Overview of your records, approvals, and health insights.</p>
            </section>

            {loading ? (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
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
            ) : null}

            {!loading ? (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.label} className="animate-rise">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardDescription>{item.label}</CardDescription>
                        <Icon className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.change}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-3">
              <Card className="animate-rise lg:col-span-2">
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>Records waiting for your approval decision.</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingList.length ? (
                    <div className="space-y-2 text-sm">
                      {pendingList.map((item) => (
                        <div key={item.id} className="rounded-xl border border-border/80 bg-background/70 px-3 py-2">
                          <p className="font-medium capitalize">{item.type} from {item.hospitalName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending records right now.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="animate-rise bg-gradient-to-br from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle>Health Momentum</CardTitle>
                  <CardDescription>A quick confidence indicator from approved records.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min(Number(cards[3]?.value || 0), 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Higher score means cleaner approval consistency.</p>
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
