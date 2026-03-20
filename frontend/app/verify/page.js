"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get("token") || "";

      if (!token) {
        setStatus("error");
        setMessage("Invalid or expired link");
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
          setMessage(result?.message || "Invalid or expired link");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully");
      } catch {
        setStatus("error");
        setMessage("Invalid or expired link");
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
