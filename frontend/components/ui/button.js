"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex min-h-[44px] items-center justify-center overflow-hidden whitespace-nowrap rounded-xl text-[15px] font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] dark:focus-visible:ring-blue-400/40 sm:text-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:shadow-lg dark:shadow-blue-500/20",
        secondary: "bg-card text-foreground border border-border hover:-translate-y-0.5 hover:bg-muted dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20",
        ghost: "text-foreground hover:bg-muted dark:text-gray-200 dark:hover:bg-white/10",
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
