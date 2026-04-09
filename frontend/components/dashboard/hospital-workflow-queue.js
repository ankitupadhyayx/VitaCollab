"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HospitalWorkflowQueue({ records, onDecision, isPending }) {
  const pending = records.filter((item) => item.status === "pending").slice(0, 6);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 bg-gradient-to-br from-card/95 via-card/88 to-primary/6 ring-1 ring-white/25 dark:ring-emerald-300/10">
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
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-gradient-to-r from-background/72 to-primary/6 p-3 shadow-[0_8px_22px_rgba(5,20,34,0.12)]">
                <div>
                  <p className="font-medium capitalize">{item.type} • {item.hospitalName || "Hospital"}</p>
                  <p className="text-xs text-muted-foreground">Patient: {item.patientName || "Assigned"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success"
                    onClick={() => onDecision(item.id, "approved")}
                    disabled={isPending(`dashboard-record:${item.id}`)}
                  >
                    {isPending(`dashboard-record:${item.id}`) ? "Updating..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-danger/30 bg-danger/15 px-3 py-1 text-xs font-semibold text-danger"
                    onClick={() => onDecision(item.id, "rejected")}
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

      <Card className="bg-gradient-to-br from-primary/12 via-accent/10 to-cyan-500/12 ring-1 ring-white/25 dark:ring-emerald-300/10">
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
}
