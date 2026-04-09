import { cn } from "@/lib/utils";

export function Card({ className, glass = true, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "premium-surface relative overflow-hidden rounded-3xl border border-border/80 text-card-foreground shadow-[0_16px_40px_rgba(5,20,34,0.12)] ring-1 ring-white/40 dark:border-white/10 dark:text-gray-200 dark:ring-emerald-300/12",
        glass
          ? "glass bg-[linear-gradient(150deg,rgba(255,255,255,0.98),rgba(236,253,250,0.86))] dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.72),rgba(8,47,73,0.38))] dark:backdrop-blur-md"
          : "bg-card dark:bg-slate-800",
        "dark:shadow-[0_18px_44px_rgba(5,20,34,0.32)]",
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
  return <h3 className={cn("text-lg font-bold tracking-[-0.02em] text-slate-900 dark:text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-relaxed text-muted-foreground dark:text-gray-300", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-2", className)} {...props} />;
}
