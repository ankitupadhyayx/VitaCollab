import { cn } from "@/lib/utils";

export function FormField({ label, hint, error, required, children, className }) {
  return (
    <label className={cn("block space-y-2.5", className)}>
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-[11px] leading-none text-danger">*</span> : null}
      </span>
      {children}
      {error ? <p className="text-[12px] leading-5 text-danger">{error}</p> : hint ? <p className="text-[12px] leading-5 text-muted-foreground">{hint}</p> : null}
    </label>
  );
}
