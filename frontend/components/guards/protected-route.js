"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/components/providers/auth-provider";

export function ProtectedRoute({ children, roles, strict = true }) {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (roles?.length && !roles.includes(user?.role)) {
      router.replace(strict ? "/forbidden" : "/dashboard");
    }
  }, [isLoading, isAuthenticated, user, roles, strict, router]);

  if (isLoading) {
    return (
      <Loader
        title="Verifying access..."
        subtitle="Confirming identity and security permissions"
        messages={["Verifying access...", "Securing your data...", "Encrypting records..."]}
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return null;
  }

  return children;
}
