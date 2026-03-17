"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const response = await forgotPassword(email);
      const tokenPreview = response?.data?.resetPreviewToken;
      toast.success(
        tokenPreview
          ? `Reset token (dev): ${tokenPreview.slice(0, 12)}...`
          : "If the email exists, reset instructions were sent."
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to process request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Card className="w-full max-w-md animate-rise">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>We will send a secure reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset link"}
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
