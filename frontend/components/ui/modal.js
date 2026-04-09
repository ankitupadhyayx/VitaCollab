"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ open, title, description, children, onClose, className }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof window === "undefined") {
      return undefined;
    }

    const body = document.body;
    const html = document.documentElement;
    const activeLocks = Number(body.dataset.modalLockCount || "0");

    if (activeLocks === 0) {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const scrollbarCompensation = window.innerWidth - html.clientWidth;

      body.dataset.modalScrollY = String(currentScrollY);
      body.style.position = "fixed";
      body.style.top = `-${currentScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";

      if (scrollbarCompensation > 0) {
        body.style.paddingRight = `${scrollbarCompensation}px`;
      }
    }

    body.dataset.modalLockCount = String(activeLocks + 1);

    return () => {
      const nextLocks = Math.max(0, Number(body.dataset.modalLockCount || "1") - 1);
      body.dataset.modalLockCount = String(nextLocks);

      if (nextLocks > 0) {
        return;
      }

      const restoreY = Number(body.dataset.modalScrollY || "0");
      delete body.dataset.modalLockCount;
      delete body.dataset.modalScrollY;

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.touchAction = "";
      body.style.paddingRight = "";

      window.scrollTo({ top: restoreY, behavior: "auto" });
    };
  }, [open]);

  if (!open) {
    return null;
  }

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        className={cn("max-h-[92vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-border/70 bg-card/95 p-4 shadow-soft sm:p-6", className)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body
  );
}
