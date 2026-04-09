"use client";

import { memo, useMemo } from "react";
import { CalendarClock, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRecordDate, getRecordStatusMeta, getRecordTypeIcon } from "@/lib/record-formatters";

const TimelineRecordRow = memo(function TimelineRecordRow({ item, onOpenRecord }) {
  const TypeIcon = getRecordTypeIcon(item.type);
  const statusMeta = getRecordStatusMeta(item.status);
  const isImportant = statusMeta.key === "pending";

  return (
    <button
      type="button"
      onClick={() => onOpenRecord(item)}
      className={`relative flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left shadow-[0_8px_20px_rgba(5,20,34,0.1)] ring-1 ring-white/20 transition ${isImportant ? "border-warning/40 bg-warning/10" : "border-border/70 bg-gradient-to-r from-background/74 to-primary/6 hover:border-primary/40 hover:bg-primary/8"}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
          <TypeIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold capitalize">{item.type} • {item.hospitalName}</p>
          <p className="text-xs text-muted-foreground">{formatRecordDate(item.createdAt || item.recordDate)}</p>
        </div>
      </div>
      <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusMeta.badgeClass}`}>
        {statusMeta.label}
      </span>
    </button>
  );
});

export default function PatientTimelineGrouped({ recordsByMonth, records, heatmapDays, healthScore, onOpenRecord }) {
  const monthGroups = useMemo(
    () =>
      Object.entries(recordsByMonth).map(([month, monthRecords]) => ({
        month,
        rows: monthRecords.slice(0, 4)
      })),
    [recordsByMonth]
  );

  return (
    <>
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-gradient-to-br from-card/95 via-card/88 to-primary/5 ring-1 ring-white/25 dark:ring-emerald-300/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Recent activity across your records and approvals, grouped by month.</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length ? (
              <div className="space-y-5">
                {monthGroups.map(({ month, rows }) => (
                  <div key={month}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{month}</p>
                    <div className="space-y-2">
                      {rows.map((item) => <TimelineRecordRow key={item.id} item={item} onOpenRecord={onOpenRecord} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent activity" description="Your activity feed will appear here as records move." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-gradient-to-br from-card/95 via-card/88 to-accent/6 ring-1 ring-white/25 dark:ring-emerald-300/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>Your data update pattern over the last 10 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-14 gap-1 rounded-2xl border border-border/60 bg-gradient-to-br from-background/70 to-primary/6 p-3 shadow-inner">
              {heatmapDays.map((intensity, index) => (
                <div
                  key={index}
                  className="h-4 rounded-sm"
                  style={{
                    background:
                      intensity === 0
                        ? "hsl(var(--muted))"
                        : intensity === 1
                          ? "rgba(16, 185, 129, 0.24)"
                          : intensity === 2
                            ? "rgba(20, 184, 166, 0.42)"
                            : intensity === 3
                              ? "rgba(13, 148, 136, 0.62)"
                              : "rgba(14, 116, 144, 0.84)"
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/95 via-card/88 to-primary/8 ring-1 ring-white/25 dark:ring-emerald-300/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{healthScore}%</p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <motion.div
                className="h-2 rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Number(healthScore || 0), 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Calculated from approval consistency and timeline freshness.</p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
