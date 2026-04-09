"use client";

import { BrainCircuit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AiHealthInsights({ insights }) {
  return (
    <Card className="bg-gradient-to-br from-primary/12 via-accent/10 to-cyan-500/12 ring-1 ring-white/30 dark:ring-emerald-300/12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Health Insights
        </CardTitle>
        <CardDescription>Dynamic suggestions based on your current record data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {insights.map((insight) => (
          <div key={insight} className="rounded-2xl border border-border/60 bg-background/70 p-3 text-muted-foreground shadow-inner">
            {insight}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
