"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { hasPermission } from "@/lib/admin-rbac";

export function useRoleGuard() {
  const { user } = useAuth();

  const adminRole = user?.adminRole || null;
  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      adminRole,
      isAdmin,
      can: (permission) => isAdmin && hasPermission(adminRole, permission),
      reason: "Insufficient permissions"
    }),
    [adminRole, isAdmin]
  );
}
