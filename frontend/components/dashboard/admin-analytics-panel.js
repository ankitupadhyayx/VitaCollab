"use client";

import { CheckCircle2, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPanel({ analyticsData }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Platform Analytics
          </CardTitle>
          <CardDescription>Total users, active hospitals, and uploaded records trend.</CardDescription>
        </CardHeader>
        <CardContent className="h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(37,99,235,0.08)" }} />
              <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/12 to-accent/12">
        <CardHeader>
          <CardTitle>Live Sync Indicator</CardTitle>
          <CardDescription>Cross-system signals from hospitals and patients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" />
            Live updates active
          </div>
          <p className="text-sm text-muted-foreground">
            Incoming events are synchronized with notification polling and approval status updates.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
