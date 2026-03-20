"use client";

export function useAuditLogger() {
  const logAction = async (payload) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vitacollab:admin-client-log", { detail: payload || {} }));
    }
  };

  return {
    logAction
  };
}
