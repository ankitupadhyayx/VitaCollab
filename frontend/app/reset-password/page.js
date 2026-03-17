"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/auth.service";

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

    try {
      setSubmitting(true);
      await resetPassword({ token, newPassword });
      toast.success("Password reset successful. You can now sign in.");
      setNewPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to reset password");
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
