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
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-primary">Primary actions</p>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[11px] font-semibold leading-none text-primary">
          Quick access
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              aria-label={action.label}
              className="group relative min-h-[88px] rounded-3xl border border-primary/20 bg-gradient-to-br from-background/96 via-background/88 to-primary/[0.11] px-4 py-3.5 text-left shadow-[0_14px_34px_rgba(5,20,34,0.14)] ring-1 ring-white/35 transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_40px_rgba(5,150,105,0.24)] active:scale-[0.99] active:shadow-[0_12px_28px_rgba(5,20,34,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:ring-emerald-300/12"
              onClick={action.onClick}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/12 blur-2xl transition group-hover:bg-primary/18" />
              <div className="relative flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-[0_8px_18px_rgba(16,185,129,0.2)]">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-[15px] font-semibold leading-5 text-foreground">{action.label}</p>
                  <p className="text-[12px] leading-4 text-muted-foreground sm:text-[13px] sm:leading-5">{action.hint}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
