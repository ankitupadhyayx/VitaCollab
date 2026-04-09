"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AUTH_COPY, normalizeAuthErrorMessage } from "@/lib/auth-feedback";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
      setInlineError(AUTH_COPY.INVALID_EMAIL);
      return;
    }

    if (!password.trim()) {
      setInlineError(AUTH_COPY.PASSWORD_REQUIRED);
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
      const message = normalizeAuthErrorMessage(error?.response?.data?.message, AUTH_COPY.LOGIN_FAILED);
      setInlineError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onResendVerification = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error(AUTH_COPY.EMAIL_REQUIRED);
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
        throw new Error(data?.message || AUTH_COPY.RESEND_VERIFICATION_FAILED);
      }

      toast.success(data?.message || AUTH_COPY.RESEND_VERIFICATION_SUCCESS);
    } catch (error) {
      toast.error(normalizeAuthErrorMessage(error?.message, AUTH_COPY.RESEND_VERIFICATION_FAILED));
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 sm:py-14">
      <Card className="w-full max-w-md animate-rise border border-slate-200/70 bg-white/95 shadow-[0_20px_60px_rgba(2,31,72,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-2xl text-slate-900 dark:text-white">Welcome back</CardTitle>
          <CardDescription className="text-slate-600 dark:text-neutral-300">Sign in to your secure VitaCollab workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <div className="space-y-2.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Email <span className="ml-1 text-[11px] leading-none text-red-400">*</span></label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={!hasValidEmail && email.length > 0}
                  className="h-11 pr-10 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                />
                {hasValidEmail ? <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" /> : null}
              </div>
            </div>

            <div className="space-y-2.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Password <span className="ml-1 text-[11px] leading-none text-red-400">*</span></label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  className="h-11 pr-10 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {inlineError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-900/20 dark:text-red-300" role="alert">
                {inlineError}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-neutral-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border border-slate-400 bg-white text-emerald-600 focus:ring-2 focus:ring-emerald-500 dark:border-neutral-500 dark:bg-neutral-800"
                />
                Remember me
              </label>
              <Link className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200" href="/forgot-password">Forgot password?</Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
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

            <p className="text-[12px] leading-5 text-slate-500 dark:text-neutral-300">We never share your data.</p>
          </form>

          <p className="mt-3 text-center text-sm text-slate-600 dark:text-neutral-300">
            Didn&apos;t verify your email?{" "}
            <button
              type="button"
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
              onClick={onResendVerification}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification"}
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-neutral-300">
            New to VitaCollab? <Link className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200" href="/signup">Create account</Link>
          </p>
          <p className="mt-3 text-center text-[12px] leading-5 text-slate-500 dark:text-neutral-300">
            By continuing, you agree to our <Link href="/terms" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200">Terms</Link>, <Link href="/privacy" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200">Privacy Policy</Link>, and <Link href="/disclaimer" className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200">Medical Disclaimer</Link>.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
