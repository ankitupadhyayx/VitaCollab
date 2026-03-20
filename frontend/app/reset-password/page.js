"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const queryToken = new URLSearchParams(search).get("token") || "";
    setToken(queryToken);
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!token.trim()) {
      toast.error("Reset token is required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: token.trim(), newPassword })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to reset password");
      }

      toast.success("Password reset successful. You can now sign in.");
      setNewPassword("");
    } catch (error) {
      const message = error?.message || "Unable to reset password";
      if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
        toast.error("Token expired");
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Card className="w-full max-w-md animate-rise">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your reset token and a new secure password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input placeholder="Reset token" value={token} onChange={(event) => setToken(event.target.value)} />
            <Input type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Updating..." : "Reset password"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Back to <Link className="font-semibold text-primary" href="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
