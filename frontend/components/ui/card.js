import { cn } from "@/lib/utils";

export function Card({ className, glass = true, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border text-card-foreground shadow-soft",
        glass ? "glass bg-card/85" : "bg-card",
        hover ? "premium-hover" : "",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-6 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-2", className)} {...props} />;
}
