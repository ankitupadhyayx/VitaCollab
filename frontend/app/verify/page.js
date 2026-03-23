"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTH_COPY, normalizeAuthErrorMessage } from "@/lib/auth-feedback";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get("token") || "";

      if (!token) {
        setStatus("error");
        setMessage(AUTH_COPY.VERIFY_INVALID_OR_EXPIRED);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
          cache: "no-store"
        });
        const result = await response.json();

        if (!response.ok || !result?.success) {
          setStatus("error");
          setMessage(normalizeAuthErrorMessage(result?.message, AUTH_COPY.VERIFY_INVALID_OR_EXPIRED));
          return;
        }

        setStatus("success");
        setMessage(result?.message || AUTH_COPY.VERIFY_SUCCESS);
      } catch {
        setStatus("error");
        setMessage(AUTH_COPY.VERIFY_FAILED);
      }
    };

    verify();
  }, []);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Card className="w-full max-w-md animate-rise">
        <CardHeader>
          <CardTitle>{status === "success" ? "Verification complete" : "Email verification"}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
