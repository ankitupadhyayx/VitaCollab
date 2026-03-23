"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ApprovalModal } from "@/components/records/approval-modal";
import { AuditLogModal } from "@/components/records/audit-log-modal";
import { RecordPreviewModal } from "@/components/records/record-preview-modal";
import { RecordCard } from "@/components/records/record-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { toAbsoluteApiUrl } from "@/services/api";
import { decideRecord, fetchMyTimeline } from "@/services/record.service";

export default function TimelinePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [preview, setPreview] = useState({ open: false, record: null });
  const [audit, setAudit] = useState({ open: false, record: null });
  const [modal, setModal] = useState({ open: false, mode: "approve", record: null });
  const toast = useToast();
  const { runOptimistic, isPending } = useOptimisticUpdate(records, setRecords);

  const loadTimeline = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTimeline();
    }, 20000);

    return () => {
      clearInterval(interval);
    };
  }, [loadTimeline]);

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
        reason: item.rejectionReason,
        version: item.version || 1,
        uploadedBy: item.hospitalName,
        approvedBy: item.status === "approved" ? "Patient" : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        approvedAt: item.approvedAt,
        rejectedAt: item.rejectedAt,
        dateRaw: item.recordDate || item.createdAt,
        optimistic: item.optimistic
      }));

    return transformed.filter((item) => {
      const byStatus = activeFilter === "all" ? true : item.status === activeFilter;
      const normalized = `${item.type} ${item.hospital} ${item.description}`.toLowerCase();
      const byQuery = debouncedQuery ? normalized.includes(debouncedQuery.toLowerCase()) : true;
      return byStatus && byQuery;
    });
  }, [records, activeFilter, debouncedQuery]);

  const onDecision = async (reason) => {
    if (!modal.record) {
      return;
    }

    try {
      const decision = modal.mode === "approve" ? "approved" : "rejected";
      const recordId = modal.record.id;
      const previousStatus = modal.record.status;
      const now = new Date().toISOString();

      const result = await runOptimistic({
        key: `record:${recordId}:decision`,
        apply: (prev) =>
          prev.map((item) =>
            item.id === recordId
              ? {
                  ...item,
                  status: decision,
                  optimistic: true,
                  updatedAt: now,
                  approvedAt: decision === "approved" ? now : item.approvedAt,
                  rejectedAt: decision === "rejected" ? now : item.rejectedAt,
                  rejectionReason: decision === "rejected" ? reason : item.rejectionReason
                }
              : item
          ),
        request: async () => decideRecord(recordId, decision, reason),
        finalize: (prev) => prev.map((item) => (item.id === recordId ? { ...item, optimistic: false } : item))
      });

      if (!result.ok) {
        toast.error(result.error?.response?.data?.message || "Failed to update record decision");
        return;
      }

      toast.success(`Record ${decision}`, {
        action: {
          label: "Undo",
          onClick: () => {
            setRecords((prev) =>
              prev.map((item) =>
                item.id === recordId
                  ? {
                      ...item,
                      status: previousStatus,
                      optimistic: false
                    }
                  : item
              )
            );
            toast.info("Action reverted locally");
          }
        }
      });

      setModal({ open: false, mode: "approve", record: null });
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
                    actionPending={isPending(`record:${record.id}:decision`) || Boolean(record.optimistic)}
                    onApprove={() => openModal(record, "approve")}
                    onReject={() => openModal(record, "reject")}
                    onAudit={(selected) => setAudit({ open: true, record: selected })}
                    onPreview={(selected) => setPreview({ open: true, record: selected })}
                  />
                ))}
              </div>
            ) : null}

            {!loading && !mapped.length ? (
              <EmptyState
                variant="records"
                onAction={() => window.location.assign("/upload-record")}
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

        <RecordPreviewModal
          open={preview.open}
          record={preview.record}
          onClose={() => setPreview({ open: false, record: null })}
        />

        <AuditLogModal
          open={audit.open}
          record={audit.record}
          onClose={() => setAudit({ open: false, record: null })}
        />
      </div>
    </ProtectedRoute>
  );
}
