"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BellDot, FileHeart, Hospital } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { useSharedNotifications } from "@/hooks/use-shared-notifications";
import { queryKeys } from "@/lib/query-keys";
import { decideRecord, fetchRecords } from "@/services/record.service";

export default function useDashboardState({ toast }) {
  const { user } = useAuth();
  const role = user?.role || "patient";
  const [records, setRecords] = useState([]);
  const { runOptimistic, isPending } = useOptimisticUpdate(records, setRecords);

  const {
    notifications,
    markRead: markNotificationAsRead
  } = useSharedNotifications({
    enabled: role === "patient",
    refetchInterval: 60000,
    refetchIntervalInBackground: false
  });

  const {
    data: recordsResponse,
    isLoading: loading,
    error: recordsError
  } = useQuery({
    queryKey: queryKeys.records,
    queryFn: () => fetchRecords({ limit: 100 }),
    enabled: Boolean(user),
    refetchInterval: 120000,
    refetchIntervalInBackground: false
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
  }, [recordsError, toast]);

  const patientInsights = useMemo(() => {
    const pendingCount = records.filter((item) => item.status === "pending").length;
    const reportLike = records.filter((item) => ["report", "lab", "diagnosis"].includes(item.type));
    const latestReport = reportLike[0] || null;
    const noCardiology = !records.some((item) => `${item.type} ${item.description || ""} ${item.hospitalName || ""}`.toLowerCase().includes("cardio"));

    const insights = [];

    if (latestReport) {
      const monthsAgo = Math.max(0, Math.floor((Date.now() - new Date(latestReport.recordDate || latestReport.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      insights.push(`Your last ${latestReport.type} was ${monthsAgo} month${monthsAgo === 1 ? "" : "s"} ago.`);
    } else {
      insights.push("No reports found yet. Upload your first diagnostic report.");
    }

    if (pendingCount > 0) {
      insights.push(`You have ${pendingCount} pending approval${pendingCount === 1 ? "" : "s"}.`);
    } else {
      insights.push("Great job. You have no pending approvals right now.");
    }

    if (noCardiology) {
      insights.push("No cardiology reports found. Consider adding one if relevant to your care plan.");
    }

    return insights;
  }, [records]);

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

  const patientSummary = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.recordDate || b.createdAt) - new Date(a.recordDate || a.createdAt));
    const lastReport = sorted[0] || null;
    const pendingApprovals = sorted.filter((item) => item.status === "pending").length;
    const connectedHospitals = new Set(sorted.map((item) => item.hospitalName || item.hospitalId)).size;
    const labRecords = sorted.filter((item) => ["lab", "report", "diagnosis"].includes(item.type));
    const overdueBloodTest = !labRecords.length || (Date.now() - new Date(labRecords[0].recordDate || labRecords[0].createdAt).getTime()) > 1000 * 60 * 60 * 24 * 180;

    return {
      lastReportDate: lastReport ? new Date(lastReport.recordDate || lastReport.createdAt).toLocaleDateString() : "No report yet",
      pendingApprovals,
      connectedHospitals,
      missingImportantReports: overdueBloodTest ? "Blood test overdue" : "No major missing report detected"
    };
  }, [records]);

  const recordsByMonth = useMemo(() => {
    return records.reduce((acc, record) => {
      const date = new Date(record.recordDate || record.createdAt);
      const key = date.toLocaleString("default", { month: "long", year: "numeric" });
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {});
  }, [records]);

  const connectedHospitals = useMemo(() => {
    const map = new Map();

    records.forEach((record) => {
      const key = record.hospitalName || String(record.hospitalId);
      const existing = map.get(key);
      const currentDate = new Date(record.createdAt || record.recordDate).getTime();
      const prevDate = existing ? new Date(existing.lastInteraction).getTime() : 0;

      if (!existing || currentDate > prevDate) {
        map.set(key, {
          name: record.hospitalName || "Unknown Hospital",
          lastInteraction: record.createdAt || record.recordDate,
          status: currentDate > Date.now() - 1000 * 60 * 60 * 24 * 60 ? "active" : "inactive"
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction));
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
        return (index + records.length) % 5;
      }),
    [records.length]
  );

  const actionableNotifications = useMemo(() => notifications.filter((item) => !item.isRead).slice(0, 4), [notifications]);

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

  return {
    role,
    loading,
    records,
    cards,
    user,
    isPending,
    quickDecision,
    patientSummary,
    patientInsights,
    recordsByMonth,
    analyticsData,
    heatmapDays,
    connectedHospitals,
    actionableNotifications,
    markNotificationAsRead,
    healthScore: Number(cards[3]?.value || 0)
  };
}
