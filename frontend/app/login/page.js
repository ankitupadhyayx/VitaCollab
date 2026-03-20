"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const onSubmit = async (event) => {
    event.preventDefault();
    setInlineError("");

    if (!hasValidEmail) {
      setInlineError("Enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setInlineError("Password is required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await login({ email, password, rememberMe });
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
      const message = error?.response?.data?.message || "Unable to sign in";
      setInlineError(message);
      toast.error(message);
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
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-12">
      <Card className="w-full max-w-md animate-rise border-slate-200 bg-white shadow-[0_20px_60px_rgba(2,31,72,0.12)]">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your secure VitaCollab workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoFocus
                  autoComplete="email"
                  aria-invalid={!hasValidEmail && email.length > 0}
                  className="pr-10"
                />
                {hasValidEmail ? <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" /> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            {inlineError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {inlineError}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Remember me
              </label>
              <Link className="font-semibold text-primary" href="/forgot-password">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </Button>

            <Button type="button" variant="secondary" className="w-full" disabled>
              Continue with Google
            </Button>
          </form>

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
