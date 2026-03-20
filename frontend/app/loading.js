"use client";

import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <motion.div
          className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-primary/40 bg-primary/10"
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
        <p className="text-sm font-medium text-foreground">Loading your workspace...</p>
        <p className="mt-1 text-xs text-muted-foreground">Preparing a secure VitaCollab session</p>
      </div>
    </main>
  );
}
