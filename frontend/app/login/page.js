"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const response = await login({ email, password });
      const role = response?.data?.user?.role;

      toast.success("Signed in successfully");
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "hospital") {
        router.push("/upload-record");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const onResendVerification = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Enter your email first");
      return;
    }

    try {
      setResending(true);
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to resend verification email");
      }

      toast.success(data?.message || "Verification email sent");
    } catch (error) {
      if (error?.message?.toLowerCase().includes("user not found")) {
        toast.error("User not found");
      } else {
        toast.error(error?.message || "Unable to resend verification email");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Card className="w-full max-w-md animate-rise">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to continue managing your health records.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link className="font-semibold text-primary" href="/forgot-password">Forgot password?</Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Didn&apos;t verify your email?{" "}
            <button
              type="button"
              className="font-semibold text-primary"
              onClick={onResendVerification}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification"}
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New to VitaCollab? <Link className="font-semibold text-primary" href="/signup">Create account</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
