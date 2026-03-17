"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, ShieldAlert, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminStats, fetchAuditLogs, fetchPendingHospitals, verifyHospital } from "@/services/admin.service";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [verifyingHospitalId, setVerifyingHospitalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const [statsRes, logsRes, pendingRes] = await Promise.all([
          fetchAdminStats(),
          fetchAuditLogs(),
          fetchPendingHospitals()
        ]);
        setStats(statsRes?.data?.metrics || null);
        setLogs(logsRes?.data?.logs || []);
        setPendingHospitals(pendingRes?.data?.hospitals || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleVerifyHospital = async (hospitalId) => {
    try {
      setVerifyingHospitalId(hospitalId);
      await verifyHospital(hospitalId);
      setPendingHospitals((prev) => prev.filter((item) => item.id !== hospitalId));
      setStats((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          hospitalsVerified: Number(prev.hospitalsVerified || 0) + 1,
          pendingHospitalVerifications: Math.max(Number(prev.pendingHospitalVerifications || 0) - 1, 0)
        };
      });
      toast.success("Hospital verified successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to verify hospital");
    } finally {
      setVerifyingHospitalId(null);
    }
  };

  const metrics = useMemo(
    () => [
      { label: "Active Patients", value: String(stats?.activePatients || 0), icon: Users },
      { label: "Hospitals Verified", value: String(stats?.hospitalsVerified || 0), icon: Building2 },
      { label: "Open Disputes", value: String(stats?.openDisputes || 0), icon: ShieldAlert },
      { label: "API Health", value: String(stats?.apiHealth || "n/a"), icon: Activity }
    ],
    [stats]
  );

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-6">
            <header>
              <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
              <p className="text-sm text-muted-foreground">Monitor platform trust, security, and growth.</p>
            </header>

            {loading ? <Loader /> : null}

            {!loading ? (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <Card key={metric.label} className="animate-rise">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardDescription>{metric.label}</CardDescription>
                        <Icon className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-3">
              <Card className="animate-rise lg:col-span-2">
                <CardHeader>
                  <CardTitle>Operational Pulse</CardTitle>
                  <CardDescription>Quick snapshot of trust and moderation activities.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/80 bg-background/70 p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Hospital Verification Queue</p>
                    <p className="mt-1 text-lg font-semibold">{stats?.pendingHospitalVerifications || 0} pending review</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/70 p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dispute Escalations</p>
                    <p className="mt-1 text-lg font-semibold">{stats?.openDisputes || 0} active threads</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-rise bg-gradient-to-br from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle>Governance Score</CardTitle>
                  <CardDescription>Simple reliability signal for admin operations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">92</p>
                  <p className="text-xs text-muted-foreground">No critical alerts in the last 24h.</p>
                </CardContent>
              </Card>
            </section>

            <Card className="animate-rise">
              <CardHeader>
                <CardTitle>Hospital Verification Queue</CardTitle>
                <CardDescription>Review new hospital signups before record uploads are allowed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingHospitals.length ? (
                  pendingHospitals.map((hospital) => (
                    <div key={hospital.id} className="flex flex-col gap-3 rounded-xl border border-border/80 bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{hospital.hospitalProfile?.hospitalName || hospital.name}</p>
                        <p className="text-xs text-muted-foreground">{hospital.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(hospital.createdAt).toLocaleDateString()} • License {hospital.hospitalProfile?.licenseNumber || "n/a"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status="pending">pending</Badge>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyHospital(hospital.id)}
                          disabled={verifyingHospitalId === hospital.id}
                        >
                          {verifyingHospitalId === hospital.id ? "Verifying..." : "Approve"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hospitals are pending verification.</p>
                )}
              </CardContent>
            </Card>

            <Card className="animate-rise">
              <CardHeader>
                <CardTitle>Recent Audit Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {logs.length ? (
                  logs.slice(0, 6).map((log) => (
                    <div key={log.id} className="rounded-xl border border-border/80 bg-background/70 px-3 py-2">
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No audit events available yet.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
