import { cn } from "@/lib/utils";

const map = {
  approved: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  rejected: "bg-danger/15 text-danger border-danger/30"
};

export function Badge({ status = "pending", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        map[status] || "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {children || status}
    </span>
  );
}
