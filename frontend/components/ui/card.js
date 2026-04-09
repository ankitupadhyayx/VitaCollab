import { cn } from "@/lib/utils";

export function Card({ className, glass = true, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border text-card-foreground shadow-soft dark:border-white/10 dark:text-gray-200",
        glass ? "glass bg-card/85 dark:bg-white/5 dark:backdrop-blur-md" : "bg-card dark:bg-slate-800",
        "dark:shadow-lg dark:shadow-emerald-500/20",
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
  return <h3 className={cn("text-lg font-semibold tracking-tight dark:text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground dark:text-gray-400", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-2", className)} {...props} />;
}
