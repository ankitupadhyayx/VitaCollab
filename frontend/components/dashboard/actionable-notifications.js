"use client";

import { BellDot } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionableNotifications({ notifications, onMarkRead, onOpenTimeline }) {
  return (
    <Card className="lg:col-span-2 bg-gradient-to-br from-card/95 via-card/88 to-primary/6 ring-1 ring-white/25 dark:ring-emerald-300/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellDot className="h-5 w-5 text-primary" />
          Actionable Notifications
        </CardTitle>
        <CardDescription>Prioritized actions that need your attention now.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.length ? (
          notifications.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-gradient-to-r from-background/72 to-primary/6 p-3 shadow-[0_8px_22px_rgba(5,20,34,0.12)]">
              <div>
                <p className="text-sm font-semibold capitalize">{item.type.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted-foreground">{item.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-border/70 bg-background/72 px-3 py-1 text-xs font-semibold text-foreground shadow-sm"
                  onClick={() => onMarkRead(item.id)}
                >
                  Mark read
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(5,150,105,0.25)]"
                  onClick={onOpenTimeline}
                >
                  Open
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No action needed" description="You are all caught up right now." variant="notifications" />
        )}
      </CardContent>
    </Card>
  );
}
