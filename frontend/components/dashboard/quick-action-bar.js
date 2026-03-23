"use client";

import { Clock3, Share2, Upload, Waypoints } from "lucide-react";

export default function QuickActionBar({ onUpload, onTimeline, onShare, onRequestReview }) {
  const actions = [
    {
      id: "upload",
      label: "Upload Record",
      hint: "Add new report instantly",
      icon: Upload,
      onClick: onUpload
    },
    {
      id: "timeline",
      label: "View Timeline",
      hint: "Review record journey",
      icon: Waypoints,
      onClick: onTimeline
    },
    {
      id: "share",
      label: "Share Record",
      hint: "Generate secure link",
      icon: Share2,
      onClick: onShare
    },
    {
      id: "review",
      label: "Request Review",
      hint: "Ask hospital for a review",
      icon: Clock3,
      onClick: onRequestReview
    }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            className="rounded-2xl border border-border/70 bg-background/50 p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
            onClick={action.onClick}
          >
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-primary" /> {action.label}
            </p>
            <p className="text-xs text-muted-foreground">{action.hint}</p>
          </button>
        );
      })}
    </section>
  );
}
