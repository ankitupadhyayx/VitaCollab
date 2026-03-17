import { HeartPulse } from "lucide-react";

export function Loader() {
  return (
    <div className="flex min-h-[180px] w-full items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-soft">
        <HeartPulse className="h-5 w-5 animate-pulse text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Loading VitaCollab data...</span>
      </div>
    </div>
  );
}
