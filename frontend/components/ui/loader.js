"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

const defaultMessages = [
  "Securing your data...",
  "Encrypting records...",
  "Verifying access...",
  "Loading your health dashboard..."
];

export function Loader({
  title,
  subtitle = "Protected by secure VitaCollab safeguards",
  messages = defaultMessages,
  fullScreen = false
}) {
  const usableMessages = useMemo(() => (messages?.length ? messages : defaultMessages), [messages]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (usableMessages.length < 2 || title) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % usableMessages.length);
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [usableMessages, title]);

  return (
    <div className={`flex w-full items-center justify-center px-4 ${fullScreen ? "min-h-screen" : "min-h-[210px]"}`}>
      <div className="w-full max-w-xl rounded-3xl border border-border/80 bg-gradient-to-br from-card/92 via-card/88 to-primary/8 p-5 shadow-[0_22px_56px_rgba(5,20,34,0.2)] ring-1 ring-white/25 backdrop-blur-xl dark:ring-emerald-300/10">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary shadow-[0_0_28px_rgba(16,185,129,0.25)]">
            <ShieldCheck className="h-5 w-5" />
            <span className="absolute inset-0 rounded-2xl border border-primary/35 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title || usableMessages[messageIndex]}</p>
            <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="loader-track relative mt-4 h-1.5 overflow-hidden rounded-full bg-muted/75" />
      </div>
    </div>
  );
}
