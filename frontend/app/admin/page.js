"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  Building2,
  CheckCircle2,
  FileClock,
  LogOut,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
  XCircle
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { toActivityExportRow, toAuditExportRow } from "@/features/admin/audit";
import { toRecordExportRow } from "@/features/admin/records";
import { toUserExportRow } from "@/features/admin/users";
import { useAuditLogger } from "@/hooks/use-audit-logger";
import { useBulkAction } from "@/hooks/use-bulk-action";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { useToast } from "@/hooks/use-toast";
import {
  bulkAdminUsersAction,
  bulkRecordAction,
  createAdmin,
  deleteAdmin,
  exportAdminDataset,
  fetchActiveSessions,
  fetchActivityFeed,
  fetchAdminRecords,
  fetchAdminStats,
  fetchAdminUserProfile,
  fetchAdminUsers,
  fetchAuditLogs,
  fetchPendingHospitals,
  forceLogoutUser,
  forceRecordAction,
  sendAdminBroadcast,
  updateAdmin,
  updateAdminUserStatus,
  verifyHospital
} from "@/services/admin.service";

const adminSections = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "User Management", icon: Users },
  { id: "records", label: "Record Oversight", icon: FileClock },
  { id: "activity", label: "Activity Monitoring", icon: AlertTriangle },
  { id: "audit", label: "Audit & Logs", icon: ShieldCheck },
  { id: "security", label: "Security Panel", icon: ShieldAlert },
  { id: "broadcast", label: "Broadcast", icon: BellRing }
];

const emptyConfirm = {
  open: false,
  type: "",
  payload: null,
  title: "",
  description: "",
  confirmLabel: "Confirm",
  danger: true,
  needsReason: false
};

const toCsvValue = (value) => {
  const normalized = value === null || typeof value === "undefined" ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const downloadCsv = (fileName, headers, rows) => {
  if (!rows.length) {
    return;
  }

  const content = [
    headers.map((item) => toCsvValue(item.label)).join(","),
    ...rows.map((row) => headers.map((item) => toCsvValue(row[item.key])).join(","))
  ].join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadBlob = (fileName, blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminPage() {
  const roleGuard = useRoleGuard();
  const usersBulk = useBulkAction();
  const recordsBulk = useBulkAction();
  const { logAction } = useAuditLogger();

  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({ dailyActivity: [], growthTrend: [] });

  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [activity, setActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [userDetail, setUserDetail] = useState(null);
  const [pendingHospitals, setPendingHospitals] = useState([]);

  const [usersFilter, setUsersFilter] = useState({ search: "", role: "all", status: "all" });
  const [recordsFilter, setRecordsFilter] = useState({ status: "all", search: "" });
  const [activityFilter, setActivityFilter] = useState("all");
  const [auditFilter, setAuditFilter] = useState({ user: "", action: "", startDate: "", endDate: "" });

  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", adminRole: "ADMIN" });
  const [confirm, setConfirm] = useState(emptyConfirm);
  const [confirmReason, setConfirmReason] = useState("");

  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [usersPageInput, setUsersPageInput] = useState("1");
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsPageSize, setRecordsPageSize] = useState(10);
  const [recordsPagination, setRecordsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [recordsPageInput, setRecordsPageInput] = useState("1");
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);
  const [activityPageInput, setActivityPageInput] = useState("1");
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [auditPageInput, setAuditPageInput] = useState("1");

  const [tableLoading, setTableLoading] = useState({
    users: false,
    records: false,
    activity: false,
    audit: false,
    sessions: false,
    pendingHospitals: false
  });
  const [actionLoading, setActionLoading] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const setTableBusy = (key, value) => {
    setTableLoading((prev) => ({ ...prev, [key]: value }));
  };

  const loadStats = async () => {
    const statsRes = await fetchAdminStats();
    setStats(statsRes?.data?.metrics || null);
    setCharts(statsRes?.data?.charts || { dailyActivity: [], growthTrend: [] });
  };

  const loadUsers = async () => {
    setTableBusy("users", true);
    try {
      const params = {
        ...(usersFilter.search ? { search: usersFilter.search } : {}),
        ...(usersFilter.role !== "all" ? { role: usersFilter.role } : {}),
        ...(usersFilter.status !== "all" ? { status: usersFilter.status } : {}),
        limit: 100
      };
      const response = await fetchAdminUsers(params);
      setUsers(response?.data?.users || []);
    } finally {
      setTableBusy("users", false);
    }
  };

  const loadRecords = async ({ page = recordsPage, limit = recordsPageSize } = {}) => {
    setTableBusy("records", true);
    try {
      const params = {
        ...(recordsFilter.status !== "all" ? { status: recordsFilter.status } : {}),
        ...(recordsFilter.search ? { search: recordsFilter.search } : {}),
        page,
        limit
      };
      const response = await fetchAdminRecords(params);
      setRecords(response?.data?.records || []);
      setRecordsPagination(response?.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } finally {
      setTableBusy("records", false);
    }
  };

  const loadActivity = async () => {
    setTableBusy("activity", true);
    try {
      const response = await fetchActivityFeed({
        ...(activityFilter === "all" ? {} : { action: activityFilter }),
        limit: 100
      });
      setActivity(response?.data?.activities || []);
    } finally {
      setTableBusy("activity", false);
    }
  };

  const loadAudit = async () => {
    setTableBusy("audit", true);
    try {
      const params = {
        ...(auditFilter.user ? { user: auditFilter.user } : {}),
        ...(auditFilter.action ? { action: auditFilter.action } : {}),
        ...(auditFilter.startDate ? { startDate: new Date(auditFilter.startDate).toISOString() } : {}),
        ...(auditFilter.endDate ? { endDate: new Date(auditFilter.endDate).toISOString() } : {}),
        limit: 100
      };
      const response = await fetchAuditLogs(params);
      setLogs(response?.data?.logs || []);
    } finally {
      setTableBusy("audit", false);
    }
  };

  const loadSessions = async () => {
    setTableBusy("sessions", true);
    try {
      const response = await fetchActiveSessions();
      setSessions(response?.data?.sessions || []);
    } finally {
      setTableBusy("sessions", false);
    }
  };

  const loadPendingHospitals = async () => {
    setTableBusy("pendingHospitals", true);
    try {
      const response = await fetchPendingHospitals();
      setPendingHospitals(response?.data?.hospitals || []);
    } finally {
      setTableBusy("pendingHospitals", false);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadRecords(),
        loadActivity(),
        loadAudit(),
        loadSessions(),
        loadPendingHospitals()
      ]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const realtimeConfigs = useMemo(
    () => [
      {
        eventName: "admin:user:updated",
        onEvent: () => {
          loadUsers();
          loadSessions();
        }
      },
      {
        eventName: "admin:record:updated",
        onEvent: () => {
          loadRecords();
        }
      },
      {
        eventName: "admin:audit:new",
        onEvent: () => {
          loadAudit();
          loadActivity();
        }
      }
    ],
    [usersFilter, recordsFilter, activityFilter, auditFilter, recordsPage, recordsPageSize]
  );

  useRealtimeEvents(realtimeConfigs);

  useEffect(() => {
    usersBulk.clear();
  }, [users]);

  useEffect(() => {
    recordsBulk.clear();
  }, [records]);

  const usersTotalPages = Math.max(1, Math.ceil(users.length / usersPageSize));
  const activityTotalPages = Math.max(1, Math.ceil(activity.length / activityPageSize));
  const auditTotalPages = Math.max(1, Math.ceil(logs.length / auditPageSize));

  const pagedUsers = useMemo(
    () => users.slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize),
    [users, usersPage, usersPageSize]
  );

  const pagedActivity = useMemo(
    () => activity.slice((activityPage - 1) * activityPageSize, activityPage * activityPageSize),
    [activity, activityPage, activityPageSize]
  );

  const pagedLogs = useMemo(
    () => logs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize),
    [logs, auditPage, auditPageSize]
  );

  useEffect(() => {
    setUsersPage((prev) => Math.min(prev, usersTotalPages));
  }, [usersTotalPages]);

  useEffect(() => {
    setUsersPageInput(String(usersPage));
  }, [usersPage]);

  useEffect(() => {
    setActivityPage((prev) => Math.min(prev, activityTotalPages));
  }, [activityTotalPages]);

  useEffect(() => {
    setActivityPageInput(String(activityPage));
  }, [activityPage]);

  useEffect(() => {
    setAuditPage((prev) => Math.min(prev, auditTotalPages));
  }, [auditTotalPages]);

  useEffect(() => {
    setAuditPageInput(String(auditPage));
  }, [auditPage]);

  useEffect(() => {
    setRecordsPageInput(String(recordsPagination.page || recordsPage));
  }, [recordsPagination.page, recordsPage]);

  const getShowingRange = (page, pageSize, total) => {
    if (!total) {
      return { start: 0, end: 0 };
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return { start, end };
  };

  const usersRange = useMemo(
    () => getShowingRange(usersPage, usersPageSize, users.length),
    [usersPage, usersPageSize, users.length]
  );

  const activityRange = useMemo(
    () => getShowingRange(activityPage, activityPageSize, activity.length),
    [activityPage, activityPageSize, activity.length]
  );

  const auditRange = useMemo(
    () => getShowingRange(auditPage, auditPageSize, logs.length),
    [auditPage, auditPageSize, logs.length]
  );

  const recordsRange = useMemo(
    () => getShowingRange(recordsPagination.page || recordsPage, recordsPageSize, recordsPagination.total || 0),
    [recordsPagination.page, recordsPagination.total, recordsPage, recordsPageSize]
  );

  const runDangerousAction = async () => {
    if (!confirm.open || !confirm.type || !confirm.payload) {
      return;
    }

    try {
      setActionLoading(confirm.type);

      if (confirm.type === "verify-hospital") {
        await verifyHospital(confirm.payload.id);
        toast.success("Hospital verified successfully");
        await Promise.all([loadPendingHospitals(), loadStats()]);
      }

      if (confirm.type === "user-status") {
        const nextPayload = {
          status: confirm.payload.status,
          reason: confirmReason || "Updated by admin"
        };

        if (confirm.payload.status === "suspended") {
          const suspensionUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          nextPayload.suspendedUntil = suspensionUntil;
        }

        await updateAdminUserStatus(confirm.payload.id, nextPayload);
        toast.success("User status updated");
        await Promise.all([loadUsers(), loadStats()]);
      }

      if (confirm.type === "record-action") {
        const payload = {
          action: confirm.payload.action,
          ...(confirm.payload.action === "rejected" ? { rejectionReason: confirmReason || "Rejected by admin" } : {}),
          ...(confirm.payload.action === "flag_suspicious" ? { flagReason: confirmReason || "Suspicious pattern detected" } : {})
        };

        await forceRecordAction(confirm.payload.id, payload);
        toast.success("Record action completed");
        await Promise.all([loadRecords(), loadStats(), loadActivity(), loadAudit(), loadSessions()]);
      }

      if (confirm.type === "force-logout") {
        await forceLogoutUser(confirm.payload.id);
        toast.success("User force logged out");
        await Promise.all([loadSessions(), loadAudit()]);
      }

      if (confirm.type === "broadcast") {
        await sendAdminBroadcast(confirm.payload.message);
        setBroadcastMessage("");
        toast.success("Broadcast sent system-wide");
        await Promise.all([loadAudit(), loadActivity()]);
      }

      if (confirm.type === "bulk-users") {
        usersBulk.setInProgress(true);
        const response = await bulkAdminUsersAction({
          action: confirm.payload.action,
          ids: confirm.payload.ids,
          reason: confirmReason || undefined
        });
        const succeeded = response?.data?.succeeded?.length || 0;
        const failed = response?.data?.failed?.length || 0;
        toast.success(`Bulk users action completed: ${succeeded} succeeded, ${failed} failed`);
        usersBulk.clear();
        await Promise.all([loadUsers(), loadStats(), loadAudit(), loadActivity()]);
      }

      if (confirm.type === "bulk-records") {
        recordsBulk.setInProgress(true);
        const response = await bulkRecordAction({
          action: confirm.payload.action,
          ids: confirm.payload.ids,
          ...(confirm.payload.action === "REJECT" ? { rejectionReason: confirmReason || "Bulk rejected by admin" } : {}),
          ...(confirm.payload.action === "FLAG" ? { flagReason: confirmReason || "Bulk flagged by admin" } : {})
        });
        const succeeded = response?.data?.succeeded?.length || 0;
        const failed = response?.data?.failed?.length || 0;
        toast.success(`Bulk records action completed: ${succeeded} succeeded, ${failed} failed`);
        recordsBulk.clear();
        await Promise.all([loadRecords(), loadStats(), loadAudit(), loadActivity(), loadSessions()]);
      }

      if (confirm.type === "admin-create") {
        await createAdmin(confirm.payload);
        setAdminForm({ name: "", email: "", password: "", adminRole: "ADMIN" });
        toast.success("Admin created");
        await Promise.all([loadUsers(), loadAudit(), loadActivity()]);
      }

      if (confirm.type === "admin-update") {
        await updateAdmin(confirm.payload.id, confirm.payload.data);
        toast.success("Admin updated");
        await Promise.all([loadUsers(), loadAudit(), loadActivity()]);
      }

      if (confirm.type === "admin-delete") {
        await deleteAdmin(confirm.payload.id);
        toast.success("Admin deleted");
        await Promise.all([loadUsers(), loadAudit(), loadActivity()]);
      }

      await logAction({ type: confirm.type, payload: confirm.payload, at: new Date().toISOString() });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      usersBulk.setInProgress(false);
      recordsBulk.setInProgress(false);
      setActionLoading("");
      setConfirm(emptyConfirm);
      setConfirmReason("");
    }
  };

  const openConfirm = ({ type, payload, title, description, confirmLabel, danger = true, needsReason = false }) => {
    setConfirm({
      open: true,
      type,
      payload,
      title,
      description,
      confirmLabel,
      danger,
      needsReason
    });
  };

  const viewUserProfile = async (id) => {
    try {
      const response = await fetchAdminUserProfile(id);
      setUserDetail(response?.data?.user || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch user profile");
    }
  };

  const metrics = useMemo(
    () => [
      { label: "Total Users", value: String(stats?.totalUsers || 0), icon: Users },
      { label: "Active Users", value: String(stats?.activeUsers || 0), icon: UserCog },
      { label: "Records Uploaded", value: String(stats?.recordsUploaded || 0), icon: FileClock },
      { label: "Approval Rate", value: `${Number(stats?.approvalRate || 0).toFixed(1)}%`, icon: CheckCircle2 }
    ],
    [stats]
  );

  const summaryBarData = useMemo(
    () => [
      { name: "Users", value: Number(stats?.totalUsers || 0) },
      { name: "Active", value: Number(stats?.activeUsers || 0) },
      { name: "Hospitals", value: Number(stats?.hospitalsVerified || 0) },
      { name: "Records", value: Number(stats?.recordsUploaded || 0) },
      { name: "Disputes", value: Number(stats?.openDisputes || 0) }
    ],
    [stats]
  );

  const hasSuspiciousSessions = useMemo(
    () => sessions.some((item) => Number(item.suspiciousScore || 0) >= 70),
    [sessions]
  );

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="grid w-full gap-4 pb-24 lg:grid-cols-[240px_minmax(0,1fr)] lg:pb-0">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Control Center</CardTitle>
                <CardDescription>System-wide operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {adminSections.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === activeSection;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium ${
                        active ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-6">
            <header>
              <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
              <p className="text-sm text-muted-foreground">Full platform visibility and operational control.</p>
            </header>

            {loading ? <Loader /> : null}

            {!loading && activeSection === "overview" ? (
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

            {!loading && activeSection === "overview" ? (
            <section className="grid gap-4 lg:grid-cols-3">
              <Card className="animate-rise lg:col-span-2">
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Live operational metrics for platform health and growth.</CardDescription>
                </CardHeader>
                <CardContent className="h-[290px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summaryBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: "rgba(37,99,235,0.08)" }} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="animate-rise bg-gradient-to-br from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle>Governance Score</CardTitle>
                  <CardDescription>System reliability and risk indicator.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">92</p>
                  <p className="text-xs text-muted-foreground">
                    {hasSuspiciousSessions ? "Suspicious sessions detected" : "No critical alerts in the last 24h."}
                  </p>
                </CardContent>
              </Card>
            </section>
            ) : null}

            {!loading && activeSection === "overview" ? (
              <section className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Uploads, approvals, and sign-ins by day.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={charts?.dailyActivity || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area dataKey="value" stroke="#2563eb" fill="rgba(37, 99, 235, 0.22)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Trend</CardTitle>
                    <CardDescription>User growth trend by month.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={charts?.growthTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {!loading && activeSection === "users" ? (
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Search, filter, inspect, suspend, and block users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                    <p className="text-sm font-semibold">Admin Management</p>
                    <p className="mb-3 text-xs text-muted-foreground">Only SUPER_ADMIN can create, update, or delete admins.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      <Input placeholder="Admin name" value={adminForm.name} onChange={(event) => setAdminForm((prev) => ({ ...prev, name: event.target.value }))} />
                      <Input placeholder="Admin email" value={adminForm.email} onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))} />
                      <Input type="password" placeholder="Temporary password" value={adminForm.password} onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))} />
                      <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm" value={adminForm.adminRole} onChange={(event) => setAdminForm((prev) => ({ ...prev, adminRole: event.target.value }))}>
                        <option value="ADMIN">ADMIN</option>
                        <option value="MODERATOR">MODERATOR</option>
                      </select>
                      <Button
                        title={!roleGuard.can("MANAGE_ADMINS") ? "Insufficient permissions" : "Create admin"}
                        disabled={!roleGuard.can("MANAGE_ADMINS") || !adminForm.name || !adminForm.email || adminForm.password.length < 8}
                        onClick={() =>
                          openConfirm({
                            type: "admin-create",
                            payload: adminForm,
                            title: "Create admin",
                            description: `Create ${adminForm.adminRole} admin ${adminForm.email}?`,
                            confirmLabel: "Create",
                            danger: false
                          })
                        }
                      >
                        Create Admin
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="relative lg:col-span-2">
                      <Input
                        placeholder="Search name or email"
                        value={usersFilter.search}
                        onChange={(event) => setUsersFilter((prev) => ({ ...prev, search: event.target.value }))}
                      />
                      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <select
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                      value={usersFilter.role}
                      onChange={(event) => setUsersFilter((prev) => ({ ...prev, role: event.target.value }))}
                    >
                      <option value="all">All roles</option>
                      <option value="patient">Patient</option>
                      <option value="hospital">Hospital</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                      value={usersFilter.status}
                      onChange={(event) => setUsersFilter((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="all">All status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setUsersPage(1);
                        loadUsers();
                      }}
                    >
                      Apply
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <select
                        className="h-9 rounded-lg border border-border bg-background px-2"
                        value={usersPageSize}
                        onChange={(event) => {
                          setUsersPageSize(Number(event.target.value));
                          setUsersPage(1);
                        }}
                      >
                        {[10, 20, 50].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export current page"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={() =>
                          downloadCsv(
                            "admin-users-current.csv",
                            [
                              { key: "name", label: "Name" },
                              { key: "email", label: "Email" },
                              { key: "role", label: "Role" },
                              { key: "accountStatus", label: "Status" },
                              { key: "lastLoginAt", label: "Last Login" }
                            ],
                            pagedUsers.map(toUserExportRow)
                          )
                        }
                      >
                        Export Current
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export filtered dataset"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={() =>
                          downloadCsv(
                            "admin-users-filtered.csv",
                            [
                              { key: "name", label: "Name" },
                              { key: "email", label: "Email" },
                              { key: "role", label: "Role" },
                              { key: "accountStatus", label: "Status" },
                              { key: "lastLoginAt", label: "Last Login" }
                            ],
                            users.map(toUserExportRow)
                          )
                        }
                      >
                        Export Filtered
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export full dataset from server"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const blob = await exportAdminDataset({ type: "users", mode: "full" });
                          downloadBlob("admin-users-full.csv", blob);
                        }}
                      >
                        Export Full
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={pagedUsers.length > 0 && pagedUsers.every((user) => usersBulk.selectedIds.includes(user.id))}
                        onChange={() => usersBulk.togglePage(pagedUsers.map((user) => user.id))}
                      />
                      Select page
                    </label>
                    <Button size="sm" variant="secondary" onClick={() => usersBulk.selectAllAcrossPages(users.map((user) => user.id))}>Select all filtered</Button>
                    <span className="text-xs text-muted-foreground">Selected: {usersBulk.selectedCount}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      title={!roleGuard.can("BULK_USERS") ? "Insufficient permissions" : "Bulk suspend selected users"}
                      disabled={!roleGuard.can("BULK_USERS") || !usersBulk.selectedCount || usersBulk.inProgress}
                      onClick={() =>
                        openConfirm({
                          type: "bulk-users",
                          payload: { action: "SUSPEND", ids: usersBulk.selectedIds },
                          title: "Bulk suspend users",
                          description: `You are about to affect ${usersBulk.selectedCount} items`,
                          confirmLabel: "Suspend selected",
                          needsReason: true
                        })
                      }
                    >
                      Bulk Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      title={!roleGuard.can("BULK_USERS") ? "Insufficient permissions" : "Bulk block selected users"}
                      disabled={!roleGuard.can("BULK_USERS") || !usersBulk.selectedCount || usersBulk.inProgress}
                      onClick={() =>
                        openConfirm({
                          type: "bulk-users",
                          payload: { action: "BLOCK", ids: usersBulk.selectedIds },
                          title: "Bulk block users",
                          description: `You are about to affect ${usersBulk.selectedCount} items`,
                          confirmLabel: "Block selected",
                          needsReason: true
                        })
                      }
                    >
                      Bulk Block
                    </Button>
                    <Button
                      size="sm"
                      title={!roleGuard.can("BULK_USERS") ? "Insufficient permissions" : "Bulk activate selected users"}
                      disabled={!roleGuard.can("BULK_USERS") || !usersBulk.selectedCount || usersBulk.inProgress}
                      onClick={() =>
                        openConfirm({
                          type: "bulk-users",
                          payload: { action: "ACTIVATE", ids: usersBulk.selectedIds },
                          title: "Bulk activate users",
                          description: `You are about to affect ${usersBulk.selectedCount} items`,
                          confirmLabel: "Activate selected",
                          danger: false
                        })
                      }
                    >
                      Bulk Activate
                    </Button>
                  </div>

                  {tableLoading.users ? <Loader /> : null}

                  {!tableLoading.users ? (
                    <div className="space-y-2">
                      {pagedUsers.map((user) => (
                        <div key={user.id} className="grid gap-3 rounded-2xl border border-border/80 bg-background/60 p-3 lg:grid-cols-[auto_1.2fr_0.8fr_0.8fr_1.2fr] lg:items-center">
                          <input
                            type="checkbox"
                            checked={usersBulk.selectedIds.includes(user.id)}
                            onChange={() => usersBulk.toggleOne(user.id)}
                          />
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div>
                            <Badge status={user.accountStatus === "blocked" ? "rejected" : user.accountStatus === "suspended" ? "pending" : "approved"}>
                              {user.accountStatus}
                            </Badge>
                            <p className="mt-1 text-xs capitalize text-muted-foreground">{user.role}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="secondary" onClick={() => viewUserProfile(user.id)}>View</Button>
                            {user.role === "admin" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  title={!roleGuard.can("MANAGE_ADMINS") ? "Insufficient permissions" : "Demote to moderator"}
                                  disabled={!roleGuard.can("MANAGE_ADMINS") || user.adminRole === "MODERATOR"}
                                  onClick={() =>
                                    openConfirm({
                                      type: "admin-update",
                                      payload: { id: user.id, data: { adminRole: "MODERATOR" } },
                                      title: "Update admin role",
                                      description: `Change ${user.email} role to MODERATOR?`,
                                      confirmLabel: "Update",
                                      danger: false
                                    })
                                  }
                                >
                                  Set Moderator
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  title={!roleGuard.can("MANAGE_ADMINS") ? "Insufficient permissions" : "Delete admin"}
                                  disabled={!roleGuard.can("MANAGE_ADMINS")}
                                  onClick={() =>
                                    openConfirm({
                                      type: "admin-delete",
                                      payload: { id: user.id },
                                      title: "Delete admin",
                                      description: `Delete admin account ${user.email}?`,
                                      confirmLabel: "Delete"
                                    })
                                  }
                                >
                                  Delete Admin
                                </Button>
                              </>
                            ) : null}
                            {user.accountStatus !== "suspended" && user.role !== "admin" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                title={!roleGuard.can("MANAGE_USERS") ? "Insufficient permissions" : "Suspend user"}
                                disabled={!roleGuard.can("MANAGE_USERS")}
                                onClick={() =>
                                  openConfirm({
                                    type: "user-status",
                                    payload: { id: user.id, status: "suspended" },
                                    title: "Suspend user account",
                                    description: `Suspend ${user.email} for 3 days?`,
                                    confirmLabel: "Suspend",
                                    needsReason: true
                                  })
                                }
                              >
                                Suspend
                              </Button>
                            ) : null}
                            {user.accountStatus !== "blocked" && user.role !== "admin" ? (
                              <Button
                                size="sm"
                                variant="danger"
                                title={!roleGuard.can("MANAGE_USERS") ? "Insufficient permissions" : "Block user"}
                                disabled={!roleGuard.can("MANAGE_USERS")}
                                onClick={() =>
                                  openConfirm({
                                    type: "user-status",
                                    payload: { id: user.id, status: "blocked" },
                                    title: "Block user account",
                                    description: `Block ${user.email} from all access?`,
                                    confirmLabel: "Block",
                                    needsReason: true
                                  })
                                }
                              >
                                Block
                              </Button>
                            ) : null}
                            {user.accountStatus !== "active" ? (
                              <Button
                                size="sm"
                                title={!roleGuard.can("MANAGE_USERS") ? "Insufficient permissions" : "Reactivate user"}
                                disabled={!roleGuard.can("MANAGE_USERS")}
                                onClick={() =>
                                  openConfirm({
                                    type: "user-status",
                                    payload: { id: user.id, status: "active" },
                                    title: "Reactivate user account",
                                    description: `Restore ${user.email} account access?`,
                                    confirmLabel: "Reactivate",
                                    danger: false
                                  })
                                }
                              >
                                Reactivate
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                      {!users.length ? <p className="text-sm text-muted-foreground">No users match your filters.</p> : null}
                    </div>
                  ) : null}

                  {!tableLoading.users && users.length ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p className="text-muted-foreground">Showing {usersRange.start}-{usersRange.end} of {users.length} • Page {usersPage} of {usersTotalPages}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="secondary" disabled={usersPage <= 1} onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                        <Button size="sm" variant="secondary" disabled={usersPage >= usersTotalPages} onClick={() => setUsersPage((prev) => Math.min(usersTotalPages, prev + 1))}>Next</Button>
                        <Input
                          type="number"
                          min={1}
                          max={usersTotalPages}
                          value={usersPageInput}
                          onChange={(event) => setUsersPageInput(event.target.value)}
                          className="h-8 w-20"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const parsed = Number(usersPageInput);
                            if (!Number.isFinite(parsed)) {
                              return;
                            }
                            const nextPage = Math.min(usersTotalPages, Math.max(1, Math.trunc(parsed)));
                            setUsersPage(nextPage);
                          }}
                        >
                          Go
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === "records" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Record Oversight</CardTitle>
                  <CardDescription>Review all records and force approve, reject, or flag suspicious.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <select
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                      value={recordsFilter.status}
                      onChange={(event) => setRecordsFilter((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Input
                      placeholder="Search records"
                      value={recordsFilter.search}
                      onChange={(event) => setRecordsFilter((prev) => ({ ...prev, search: event.target.value }))}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setRecordsPage(1);
                        loadRecords({ page: 1, limit: recordsPageSize });
                      }}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRecordsFilter({ status: "all", search: "" });
                        setRecordsPage(1);
                        loadRecords({ page: 1, limit: recordsPageSize });
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <select
                        className="h-9 rounded-lg border border-border bg-background px-2"
                        value={recordsPageSize}
                        onChange={(event) => {
                          const size = Number(event.target.value);
                          setRecordsPageSize(size);
                          setRecordsPage(1);
                          loadRecords({ page: 1, limit: size });
                        }}
                      >
                        {[10, 20, 50].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export current page"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={() =>
                          downloadCsv(
                            "admin-records-current.csv",
                            [
                              { key: "id", label: "Record ID" },
                              { key: "type", label: "Type" },
                              { key: "hospitalName", label: "Hospital" },
                              { key: "patientId", label: "Patient ID" },
                              { key: "status", label: "Status" },
                              { key: "createdAt", label: "Created At" }
                            ],
                            records.map(toRecordExportRow)
                          )
                        }
                      >
                        Export Current
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export filtered dataset"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const filters = {
                            ...(recordsFilter.status !== "all" ? { status: recordsFilter.status } : {}),
                            ...(recordsFilter.search ? { search: recordsFilter.search } : {})
                          };
                          const blob = await exportAdminDataset({ type: "records", mode: "filtered", filters: JSON.stringify(filters) });
                          downloadBlob("admin-records-filtered.csv", blob);
                        }}
                      >
                        Export Filtered
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export full dataset from server"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const blob = await exportAdminDataset({ type: "records", mode: "full" });
                          downloadBlob("admin-records-full.csv", blob);
                        }}
                      >
                        Export Full
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={records.length > 0 && records.every((record) => recordsBulk.selectedIds.includes(record.id))}
                        onChange={() => recordsBulk.togglePage(records.map((record) => record.id))}
                      />
                      Select page
                    </label>
                    <Button size="sm" variant="secondary" onClick={() => recordsBulk.selectAllAcrossPages(records.map((record) => record.id))}>Select all loaded</Button>
                    <span className="text-xs text-muted-foreground">Selected: {recordsBulk.selectedCount}</span>
                    <Button
                      size="sm"
                      title={!roleGuard.can("BULK_RECORDS") ? "Insufficient permissions" : "Bulk approve selected records"}
                      disabled={!roleGuard.can("BULK_RECORDS") || !recordsBulk.selectedCount || recordsBulk.inProgress}
                      onClick={() =>
                        openConfirm({
                          type: "bulk-records",
                          payload: { action: "APPROVE", ids: recordsBulk.selectedIds },
                          title: "Bulk approve records",
                          description: `You are about to affect ${recordsBulk.selectedCount} items`,
                          confirmLabel: "Approve selected",
                          danger: false
                        })
                      }
                    >
                      Bulk Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      title={!roleGuard.can("BULK_RECORDS") ? "Insufficient permissions" : "Bulk reject selected records"}
                      disabled={!roleGuard.can("BULK_RECORDS") || !recordsBulk.selectedCount || recordsBulk.inProgress}
                      onClick={() =>
                        openConfirm({
                          type: "bulk-records",
                          payload: { action: "REJECT", ids: recordsBulk.selectedIds },
                          title: "Bulk reject records",
                          description: `You are about to affect ${recordsBulk.selectedCount} items`,
                          confirmLabel: "Reject selected",
                          needsReason: true
                        })
                      }
                    >
                      Bulk Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      title={!roleGuard.can("BULK_RECORDS") ? "Insufficient permissions" : "Bulk flag selected records"}
                      disabled={!roleGuard.can("BULK_RECORDS") || !recordsBulk.selectedCount || recordsBulk.inProgress}
                      onClick={() =>
                        openConfirm({
                          type: "bulk-records",
                          payload: { action: "FLAG", ids: recordsBulk.selectedIds },
                          title: "Bulk flag records",
                          description: `You are about to affect ${recordsBulk.selectedCount} items`,
                          confirmLabel: "Flag selected",
                          needsReason: true
                        })
                      }
                    >
                      Bulk Flag
                    </Button>
                  </div>

                  {tableLoading.records ? <Loader /> : null}

                  {!tableLoading.records ? (
                    <div className="space-y-2">
                      {records.map((record) => (
                        <div key={record.id} className="grid gap-3 rounded-2xl border border-border/80 bg-background/60 p-3 lg:grid-cols-[auto_1fr_0.9fr_1.4fr] lg:items-center">
                          <input
                            type="checkbox"
                            checked={recordsBulk.selectedIds.includes(record.id)}
                            onChange={() => recordsBulk.toggleOne(record.id)}
                          />
                          <div>
                            <p className="font-semibold text-foreground capitalize">{record.type}</p>
                            <p className="text-xs text-muted-foreground">{record.hospitalName || "Hospital"} • Patient: {String(record.patientId || "-")}</p>
                            <p className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <Badge status={record.status}>{record.status}</Badge>
                            {record.flaggedSuspicious ? <p className="mt-1 text-xs text-danger">Suspicious flagged</p> : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              title={!roleGuard.can("MANAGE_RECORDS") ? "Insufficient permissions" : "Approve record"}
                              disabled={!roleGuard.can("MANAGE_RECORDS")}
                              onClick={() => openConfirm({ type: "record-action", payload: { id: record.id, action: "approved" }, title: "Force approve record", description: "Force approve this record?", confirmLabel: "Approve", danger: false })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              title={!roleGuard.can("MANAGE_RECORDS") ? "Insufficient permissions" : "Reject record"}
                              disabled={!roleGuard.can("MANAGE_RECORDS")}
                              onClick={() =>
                                openConfirm({
                                  type: "record-action",
                                  payload: { id: record.id, action: "rejected" },
                                  title: "Force reject record",
                                  description: "Reject this record and notify relevant parties?",
                                  confirmLabel: "Reject",
                                  needsReason: true
                                })
                              }
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              title={!roleGuard.can("MANAGE_RECORDS") ? "Insufficient permissions" : "Flag suspicious"}
                              disabled={!roleGuard.can("MANAGE_RECORDS")}
                              onClick={() =>
                                openConfirm({
                                  type: "record-action",
                                  payload: { id: record.id, action: "flag_suspicious" },
                                  title: "Flag suspicious record",
                                  description: "Flag this record for suspicious activity monitoring?",
                                  confirmLabel: "Flag",
                                  needsReason: true
                                })
                              }
                            >
                              Flag Suspicious
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!records.length ? <p className="text-sm text-muted-foreground">No records found for selected filters.</p> : null}
                    </div>
                  ) : null}

                  {!tableLoading.records && records.length ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p className="text-muted-foreground">
                        Showing {recordsRange.start}-{recordsRange.end} of {recordsPagination.total || records.length} • Page {recordsPagination.page || recordsPage} of {recordsPagination.totalPages || 1}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={(recordsPagination.page || recordsPage) <= 1}
                          onClick={() => {
                            const nextPage = Math.max(1, (recordsPagination.page || recordsPage) - 1);
                            setRecordsPage(nextPage);
                            loadRecords({ page: nextPage, limit: recordsPageSize });
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={(recordsPagination.page || recordsPage) >= (recordsPagination.totalPages || 1)}
                          onClick={() => {
                            const nextPage = Math.min(recordsPagination.totalPages || 1, (recordsPagination.page || recordsPage) + 1);
                            setRecordsPage(nextPage);
                            loadRecords({ page: nextPage, limit: recordsPageSize });
                          }}
                        >
                          Next
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={recordsPagination.totalPages || 1}
                          value={recordsPageInput}
                          onChange={(event) => setRecordsPageInput(event.target.value)}
                          className="h-8 w-20"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const parsed = Number(recordsPageInput);
                            if (!Number.isFinite(parsed)) {
                              return;
                            }
                            const maxPage = recordsPagination.totalPages || 1;
                            const nextPage = Math.min(maxPage, Math.max(1, Math.trunc(parsed)));
                            setRecordsPage(nextPage);
                            loadRecords({ page: nextPage, limit: recordsPageSize });
                          }}
                        >
                          Go
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === "activity" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Activity Monitoring</CardTitle>
                  <CardDescription>Global feed for uploads, approvals, and logins.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "uploads", label: "Uploads" },
                      { id: "approvals", label: "Approvals" },
                      { id: "logins", label: "Logins" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${activityFilter === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        onClick={() => setActivityFilter(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setActivityPage(1);
                        loadActivity();
                      }}
                    >
                      Refresh
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <select
                        className="h-9 rounded-lg border border-border bg-background px-2"
                        value={activityPageSize}
                        onChange={(event) => {
                          setActivityPageSize(Number(event.target.value));
                          setActivityPage(1);
                        }}
                      >
                        {[10, 20, 50].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export current page"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={() =>
                          downloadCsv(
                            "admin-activity-current.csv",
                            [
                              { key: "action", label: "Action" },
                              { key: "userId", label: "User ID" },
                              { key: "timestamp", label: "Timestamp" }
                            ],
                            pagedActivity.map(toActivityExportRow)
                          )
                        }
                      >
                        Export Current
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export filtered dataset"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const filters = activityFilter === "all" ? {} : { action: activityFilter };
                          const blob = await exportAdminDataset({ type: "activity", mode: "filtered", filters: JSON.stringify(filters) });
                          downloadBlob("admin-activity-filtered.csv", blob);
                        }}
                      >
                        Export Filtered
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export full dataset"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const blob = await exportAdminDataset({ type: "activity", mode: "full" });
                          downloadBlob("admin-activity-full.csv", blob);
                        }}
                      >
                        Export Full
                      </Button>
                    </div>
                  </div>

                  {tableLoading.activity ? <Loader /> : null}
                  {!tableLoading.activity ? (
                    <div className="space-y-2">
                      {pagedActivity.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-border/80 bg-background/60 p-3">
                          <p className="font-semibold text-foreground">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">User: {String(entry.userId || "system")}</p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                      {!activity.length ? <p className="text-sm text-muted-foreground">No activity entries found.</p> : null}
                    </div>
                  ) : null}

                  {!tableLoading.activity && activity.length ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p className="text-muted-foreground">Showing {activityRange.start}-{activityRange.end} of {activity.length} • Page {activityPage} of {activityTotalPages}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="secondary" disabled={activityPage <= 1} onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                        <Button size="sm" variant="secondary" disabled={activityPage >= activityTotalPages} onClick={() => setActivityPage((prev) => Math.min(activityTotalPages, prev + 1))}>Next</Button>
                        <Input
                          type="number"
                          min={1}
                          max={activityTotalPages}
                          value={activityPageInput}
                          onChange={(event) => setActivityPageInput(event.target.value)}
                          className="h-8 w-20"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const parsed = Number(activityPageInput);
                            if (!Number.isFinite(parsed)) {
                              return;
                            }
                            const nextPage = Math.min(activityTotalPages, Math.max(1, Math.trunc(parsed)));
                            setActivityPage(nextPage);
                          }}
                        >
                          Go
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === "audit" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Audit & Logs</CardTitle>
                  <CardDescription>Filter logs by user, action, and date range.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <Input placeholder="User ID" value={auditFilter.user} onChange={(event) => setAuditFilter((prev) => ({ ...prev, user: event.target.value }))} />
                    <Input placeholder="Action" value={auditFilter.action} onChange={(event) => setAuditFilter((prev) => ({ ...prev, action: event.target.value }))} />
                    <Input type="date" value={auditFilter.startDate} onChange={(event) => setAuditFilter((prev) => ({ ...prev, startDate: event.target.value }))} />
                    <Input type="date" value={auditFilter.endDate} onChange={(event) => setAuditFilter((prev) => ({ ...prev, endDate: event.target.value }))} />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAuditPage(1);
                        loadAudit();
                      }}
                    >
                      Apply
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <select
                        className="h-9 rounded-lg border border-border bg-background px-2"
                        value={auditPageSize}
                        onChange={(event) => {
                          setAuditPageSize(Number(event.target.value));
                          setAuditPage(1);
                        }}
                      >
                        {[10, 20, 50].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export current page"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={() =>
                          downloadCsv(
                            "admin-audit-current.csv",
                            [
                              { key: "action", label: "Action" },
                              { key: "userId", label: "User ID" },
                              { key: "timestamp", label: "Timestamp" },
                              { key: "metadata", label: "Metadata" }
                            ],
                            pagedLogs.map(toAuditExportRow)
                          )
                        }
                      >
                        Export Current
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export filtered dataset"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const filters = {
                            ...(auditFilter.user ? { userId: auditFilter.user } : {}),
                            ...(auditFilter.action ? { action: auditFilter.action } : {})
                          };
                          const blob = await exportAdminDataset({ type: "audit", mode: "filtered", filters: JSON.stringify(filters) });
                          downloadBlob("admin-audit-filtered.csv", blob);
                        }}
                      >
                        Export Filtered
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        title={!roleGuard.can("EXPORT") ? "Insufficient permissions" : "Export full dataset"}
                        disabled={!roleGuard.can("EXPORT")}
                        onClick={async () => {
                          const blob = await exportAdminDataset({ type: "audit", mode: "full" });
                          downloadBlob("admin-audit-full.csv", blob);
                        }}
                      >
                        Export Full
                      </Button>
                    </div>
                  </div>

                  {tableLoading.audit ? <Loader /> : null}
                  {!tableLoading.audit ? (
                    <div className="space-y-2">
                      {pagedLogs.map((log) => (
                        <div key={log.id} className="rounded-2xl border border-border/80 bg-background/60 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-foreground">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">User: {String(log.userId || "system")}</p>
                          {log.metadata ? <p className="mt-1 text-xs text-muted-foreground">{JSON.stringify(log.metadata)}</p> : null}
                        </div>
                      ))}
                      {!logs.length ? <p className="text-sm text-muted-foreground">No audit logs match your filters.</p> : null}
                    </div>
                  ) : null}

                  {!tableLoading.audit && logs.length ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p className="text-muted-foreground">Showing {auditRange.start}-{auditRange.end} of {logs.length} • Page {auditPage} of {auditTotalPages}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="secondary" disabled={auditPage <= 1} onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                        <Button size="sm" variant="secondary" disabled={auditPage >= auditTotalPages} onClick={() => setAuditPage((prev) => Math.min(auditTotalPages, prev + 1))}>Next</Button>
                        <Input
                          type="number"
                          min={1}
                          max={auditTotalPages}
                          value={auditPageInput}
                          onChange={(event) => setAuditPageInput(event.target.value)}
                          className="h-8 w-20"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const parsed = Number(auditPageInput);
                            if (!Number.isFinite(parsed)) {
                              return;
                            }
                            const nextPage = Math.min(auditTotalPages, Math.max(1, Math.trunc(parsed)));
                            setAuditPage(nextPage);
                          }}
                        >
                          Go
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === "security" ? (
              <section className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Panel</CardTitle>
                    <CardDescription>Review active sessions and suspicious activity.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
                      {hasSuspiciousSessions ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-danger/15 px-3 py-1 text-danger"><XCircle className="h-4 w-4" /> Suspicious sessions detected</span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-success"><CheckCircle2 className="h-4 w-4" /> No suspicious sessions</span>
                      )}
                    </div>

                    {tableLoading.sessions ? <Loader /> : null}

                    {!tableLoading.sessions ? (
                      sessions.map((session) => (
                        <div key={session.id} className="grid gap-2 rounded-2xl border border-border/80 bg-background/60 p-3 lg:grid-cols-[1fr_0.6fr_0.8fr] lg:items-center">
                          <div>
                            <p className="font-semibold text-foreground">{session.name} ({session.email})</p>
                            <p className="text-xs text-muted-foreground">Role: {session.role} • Last login: {session.lastLoginAt ? new Date(session.lastLoginAt).toLocaleString() : "Unknown"}</p>
                          </div>
                          <div>
                            <Badge status={Number(session.suspiciousScore || 0) >= 70 ? "rejected" : "approved"}>
                              Risk {session.suspiciousScore || 0}
                            </Badge>
                            <p className="mt-1 text-xs text-muted-foreground">Level: {session.riskLevel || "LOW"}</p>
                            {Number(session.riskMetadata?.rateLimitHits || 0) >= 3 ? <p className="text-xs text-danger">Rate limit threshold exceeded</p> : null}
                            {Number(session.riskMetadata?.failedLoginCount || 0) >= 3 ? <p className="text-xs text-danger">Multiple failed logins detected</p> : null}
                          </div>
                          <div className="flex justify-start lg:justify-end">
                            <Button
                              size="sm"
                              variant="danger"
                              title={!roleGuard.can("FORCE_LOGOUT") ? "Insufficient permissions" : "Force logout session"}
                              disabled={!roleGuard.can("FORCE_LOGOUT")}
                              onClick={() =>
                                openConfirm({
                                  type: "force-logout",
                                  payload: { id: session.id },
                                  title: "Force logout user",
                                  description: `Revoke all active sessions for ${session.email}?`,
                                  confirmLabel: "Force logout"
                                })
                              }
                            >
                              <LogOut className="h-4 w-4" /> Force Logout
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : null}

                    {!tableLoading.sessions && !sessions.length ? <p className="text-sm text-muted-foreground">No active sessions found.</p> : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hospital Verification Queue</CardTitle>
                    <CardDescription>Approve pending hospital onboarding requests.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tableLoading.pendingHospitals ? <Loader /> : null}
                    {!tableLoading.pendingHospitals ? (
                      pendingHospitals.map((hospital) => (
                        <div key={hospital.id} className="grid gap-2 rounded-2xl border border-border/80 bg-background/60 p-3 lg:grid-cols-[1fr_auto] lg:items-center">
                          <div>
                            <p className="font-semibold text-foreground">{hospital.hospitalProfile?.hospitalName || hospital.name}</p>
                            <p className="text-xs text-muted-foreground">{hospital.email} • License: {hospital.hospitalProfile?.licenseNumber || "n/a"}</p>
                          </div>
                          <Button
                            size="sm"
                            title={!roleGuard.can("VERIFY_HOSPITAL") ? "Insufficient permissions" : "Approve hospital"}
                            disabled={!roleGuard.can("VERIFY_HOSPITAL")}
                            onClick={() =>
                              openConfirm({
                                type: "verify-hospital",
                                payload: { id: hospital.id },
                                title: "Approve hospital verification",
                                description: `Approve ${hospital.email} for record operations?`,
                                confirmLabel: "Approve",
                                danger: false
                              })
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      ))
                    ) : null}
                    {!tableLoading.pendingHospitals && !pendingHospitals.length ? <p className="text-sm text-muted-foreground">No hospitals pending verification.</p> : null}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {!loading && activeSection === "broadcast" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Broadcast</CardTitle>
                  <CardDescription>Send system-wide announcements to all users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    rows={5}
                    className="w-full rounded-2xl border border-border bg-background p-3 text-sm"
                    placeholder="Write system announcement..."
                    value={broadcastMessage}
                    onChange={(event) => setBroadcastMessage(event.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setBroadcastMessage("")}>Clear</Button>
                    <Button
                      variant="danger"
                      title={!roleGuard.can("BROADCAST") ? "Insufficient permissions" : "Send system broadcast"}
                      disabled={!roleGuard.can("BROADCAST") || broadcastMessage.trim().length < 10}
                      onClick={() =>
                        openConfirm({
                          type: "broadcast",
                          payload: { message: broadcastMessage.trim() },
                          title: "Broadcast announcement",
                          description: "This will notify all users across the system.",
                          confirmLabel: "Send broadcast"
                        })
                      }
                    >
                      Send Broadcast
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            </div>
          </main>
        </div>

        <Modal
          open={confirm.open}
          onClose={() => {
            setConfirm(emptyConfirm);
            setConfirmReason("");
          }}
          title={confirm.title}
          description={confirm.description}
          className="max-w-md"
        >
          <div className="space-y-4">
            {confirm.needsReason ? (
              <Input
                placeholder="Add reason"
                value={confirmReason}
                onChange={(event) => setConfirmReason(event.target.value)}
              />
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirm(emptyConfirm);
                  setConfirmReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant={confirm.danger ? "danger" : "default"}
                disabled={Boolean(actionLoading)}
                onClick={runDangerousAction}
              >
                {actionLoading ? "Processing..." : confirm.confirmLabel}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={Boolean(userDetail)}
          onClose={() => setUserDetail(null)}
          title="User Profile"
          description="Detailed user profile information"
          className="max-w-lg"
        >
          {userDetail ? (
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Name:</span> {userDetail.name}</p>
              <p><span className="font-semibold">Email:</span> {userDetail.email}</p>
              <p><span className="font-semibold">Role:</span> {userDetail.role}</p>
              <p><span className="font-semibold">Status:</span> {userDetail.accountStatus || "active"}</p>
              <p><span className="font-semibold">Verified:</span> {String(userDetail.verified || userDetail.isVerified || false)}</p>
              <p><span className="font-semibold">Created At:</span> {userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleString() : "-"}</p>
              <p><span className="font-semibold">Last Login:</span> {userDetail.lastLoginAt ? new Date(userDetail.lastLoginAt).toLocaleString() : "Never"}</p>
            </div>
          ) : null}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
