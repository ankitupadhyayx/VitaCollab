"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ApprovalModal } from "@/components/records/approval-modal";
import { RecordCard } from "@/components/records/record-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { toAbsoluteApiUrl } from "@/services/api";
import { decideRecord, fetchMyTimeline } from "@/services/record.service";

export default function TimelinePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "approve", record: null });
  const toast = useToast();

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const [approvedRes, pendingRes, rejectedRes] = await Promise.all([
        fetchMyTimeline("approved"),
        fetchMyTimeline("pending"),
        fetchMyTimeline("rejected")
      ]);

      const merged = [
        ...(approvedRes?.data?.timeline || []),
        ...(pendingRes?.data?.timeline || []),
        ...(rejectedRes?.data?.timeline || [])
      ].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

      setRecords(merged);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load timeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const openModal = (record, mode) => setModal({ open: true, mode, record });

  const mapped = useMemo(() => {
    const transformed = records.map((item) => ({
        id: item.id,
        date: new Date(item.recordDate || item.createdAt).toLocaleDateString(),
        type: item.type,
        hospital: item.hospitalName,
        description: item.description,
        fileName: (item.fileUrl || item.filePath || "medical-file").split("/").pop(),
        fileLink: item.fileUrl || toAbsoluteApiUrl(item.filePath),
        category: item.fileMimeType || "record",
        status: item.status,
        reason: item.rejectionReason
      }));

    return transformed.filter((item) => {
      const byStatus = activeFilter === "all" ? true : item.status === activeFilter;
      const normalized = `${item.type} ${item.hospital} ${item.description}`.toLowerCase();
      const byQuery = query ? normalized.includes(query.toLowerCase()) : true;
      return byStatus && byQuery;
    });
  }, [records, activeFilter, query]);

  const onDecision = async (reason) => {
    if (!modal.record) {
      return;
    }

    try {
      const decision = modal.mode === "approve" ? "approved" : "rejected";
      await decideRecord(modal.record.id, decision, reason);
      toast.success(`Record ${decision}`);
      setModal({ open: false, mode: "approve", record: null });
      await loadTimeline();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update record decision");
    }
  };

  return (
    <ProtectedRoute roles={["patient", "admin"]}>
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar />
          <main className="w-full space-y-4">
            <header className="animate-rise">
              <h1 className="text-3xl font-bold tracking-tight">Health Timeline</h1>
              <p className="text-sm text-muted-foreground">A verified feed of your medical journey.</p>
            </header>

            <section className="animate-rise rounded-2xl border border-border bg-card/70 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "approved", label: "Approved" },
                    { key: "rejected", label: "Rejected" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveFilter(item.key)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        activeFilter === item.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Search hospital, type, or description"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-72"
                />
              </div>
            </section>

            {loading ? <Loader /> : null}

            {!loading && mapped.length ? (
              <div className="space-y-4">
                {mapped.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    showActions
                    onApprove={() => openModal(record, "approve")}
                    onReject={() => openModal(record, "reject")}
                  />
                ))}
              </div>
            ) : null}

            {!loading && !mapped.length ? (
              <EmptyState
                title="No records yet"
                description="Approved records will appear in your timeline once providers upload them."
              />
            ) : null}
          </main>
        </div>

        <ApprovalModal
          open={modal.open}
          mode={modal.mode}
          onClose={() => setModal({ open: false, mode: "approve", record: null })}
          onSubmit={onDecision}
        />
      </div>
    </ProtectedRoute>
  );
}
