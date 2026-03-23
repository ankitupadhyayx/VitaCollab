"use client";

import { BellDot } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionableNotifications({ notifications, onMarkRead, onOpenTimeline }) {
  return (
    <Card className="lg:col-span-2">
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
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-background/50 p-3">
              <div>
                <p className="text-sm font-semibold capitalize">{item.type.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted-foreground">{item.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-muted px-3 py-1 text-xs font-semibold text-foreground"
                  onClick={() => onMarkRead(item.id)}
                >
                  Mark read
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
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
