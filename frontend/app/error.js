"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // Keep details visible for local debugging only.
      console.error(error);
    }
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="glass-card w-full max-w-lg rounded-3xl p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load this view. Please try again, or return to your dashboard.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={reset}>Try Again</Button>
          <Button type="button" variant="outline" onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</Button>
        </div>
      </section>
    </main>
  );
}
