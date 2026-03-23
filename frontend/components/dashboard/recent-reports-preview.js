"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRecordShortDate, getRecordStatusMeta } from "@/lib/record-formatters";

export default function RecentReportsPreview({ records }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 health-grid">
        <CardHeader>
          <CardTitle>Recent Reports Preview</CardTitle>
          <CardDescription>Your last uploaded or received documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {records.slice(0, 5).map((item) => {
            const statusMeta = getRecordStatusMeta(item.status);
            return (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-background/65 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{formatRecordShortDate(item.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
              </div>
            );
          })}
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
  );
}
