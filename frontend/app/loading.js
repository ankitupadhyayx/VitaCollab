"use client";

import { Loader } from "@/components/ui/loader";

export default function GlobalLoading() {
  return (
    <main className="main-shell">
      <Loader
        fullScreen
        subtitle="Applying end-to-end safeguards before loading your workspace"
        messages={[
          "Securing your data...",
          "Encrypting records...",
          "Verifying access...",
          "Loading your health dashboard..."
        ]}
      />
    </main>
  );
}
