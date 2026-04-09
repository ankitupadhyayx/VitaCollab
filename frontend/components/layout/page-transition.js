"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const interactionMessages = [
  "Securing your data...",
  "Encrypting records...",
  "Verifying access...",
  "Loading your health dashboard..."
];

export function PageTransition({ children }) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const [showRouteProgress, setShowRouteProgress] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const timeoutRef = useRef(null);

  const triggerProgress = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setShowRouteProgress(true);
    setMessageIndex((prev) => (prev + 1) % interactionMessages.length);
    timeoutRef.current = window.setTimeout(() => setShowRouteProgress(false), 520);
  };

  useEffect(() => {
    const clickHandler = (event) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element) {
        return;
      }

      const interactiveTarget = element.closest("a[href], button, [role='button'], input[type='submit']");
      if (!interactiveTarget || interactiveTarget.hasAttribute("disabled") || interactiveTarget.getAttribute("aria-disabled") === "true") {
        return;
      }

      triggerProgress();
    };

    document.addEventListener("click", clickHandler, true);
    return () => document.removeEventListener("click", clickHandler, true);
  }, []);

  useEffect(() => {
    if (previousPathRef.current === pathname) {
      return;
    }

    previousPathRef.current = pathname;
    triggerProgress();
  }, [pathname]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <>
      <AnimatePresence>
        {showRouteProgress ? (
          <>
            <motion.div
              className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full w-[36%] rounded-full bg-gradient-to-r from-emerald-400/70 via-teal-400 to-cyan-400/80 shadow-[0_0_20px_rgba(20,184,166,0.65)]"
                initial={{ x: "-120%" }}
                animate={{ x: "330%" }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.div
              className="pointer-events-none fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full border border-emerald-300/45 bg-card/88 px-4 py-1.5 text-[12px] font-semibold leading-none tracking-[0.01em] text-emerald-700 shadow-[0_10px_24px_rgba(15,23,42,0.2)] backdrop-blur-md dark:border-emerald-400/25 dark:bg-slate-900/88 dark:text-emerald-200"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {interactionMessages[messageIndex]}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
