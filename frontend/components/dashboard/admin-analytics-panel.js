"use client";

import { CheckCircle2, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPanel({ analyticsData }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 bg-gradient-to-br from-card/95 via-card/88 to-primary/6 ring-1 ring-white/25 dark:ring-emerald-300/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Platform Analytics
          </CardTitle>
          <CardDescription>Total users, active hospitals, and uploaded records trend.</CardDescription>
        </CardHeader>
        <CardContent className="h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData} margin={{ top: 8, right: 8, left: -12, bottom: 4 }} barCategoryGap="22%">
              <defs>
                <linearGradient id="analyticsBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0.92} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.24)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} dy={4} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                cursor={{ fill: "rgba(16,185,129,0.10)" }}
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  background: "rgba(15, 23, 42, 0.92)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 16px 35px rgba(2, 6, 23, 0.35)",
                  padding: "8px 10px"
                }}
                labelStyle={{ color: "#e5e7eb", fontSize: 12, fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: "#99f6e4", fontSize: 12, fontWeight: 600 }}
              />
              <Bar dataKey="total" radius={[10, 10, 4, 4]} fill="url(#analyticsBarGradient)" barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/12 via-accent/10 to-cyan-500/12 ring-1 ring-white/25 dark:ring-emerald-300/10">
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
