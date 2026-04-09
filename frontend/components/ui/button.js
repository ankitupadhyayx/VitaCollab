"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex min-h-[44px] items-center justify-center overflow-hidden whitespace-nowrap rounded-xl text-[15px] font-semibold tracking-[-0.01em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] dark:focus-visible:ring-emerald-300/70 sm:text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(115deg,#059669,#0f766e_55%,#0e7490)] text-primary-foreground shadow-[0_14px_30px_rgba(5,150,105,0.35)] ring-1 ring-emerald-300/35 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(13,148,136,0.42)] dark:bg-[linear-gradient(115deg,#10b981,#0d9488_55%,#0891b2)] dark:text-white dark:ring-emerald-300/20",
        secondary:
          "bg-card/92 text-foreground border border-border/80 shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-white/35 hover:-translate-y-0.5 hover:bg-muted/80 hover:shadow-[0_12px_26px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/10 dark:text-gray-100 dark:ring-white/5 dark:hover:bg-white/20",
        ghost: "text-foreground hover:bg-muted/80 dark:text-gray-100 dark:hover:bg-white/10",
        danger: "bg-danger text-danger-foreground hover:-translate-y-0.5 hover:bg-danger/90"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-10 rounded-lg px-3",
        lg: "h-11 px-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    const [ripples, setRipples] = React.useState([]);

    const createRipple = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      const id = Date.now();

      setRipples((prev) => [...prev, { id, x, y, size }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
      }, 520);
    };

    const handleClick = (event) => {
      createRipple(event);
      props.onClick?.(event);
    };

    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} onClick={handleClick}>
        {variant === "default" ? <span className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" /> : null}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">{props.children}</span>
        <span className="pointer-events-none absolute inset-0 z-0">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/35 animate-ripple"
              style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
            />
          ))}
        </span>
      </button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
