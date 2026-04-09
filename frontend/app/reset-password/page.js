"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AUTH_COPY, normalizeAuthErrorMessage } from "@/lib/auth-feedback";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const passwordStrength = useMemo(() => {
    const value = newPassword;
    if (!value) return { score: 0, label: "Add a strong password" };

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return { score, label: "Weak" };
    if (score <= 3) return { score, label: "Moderate" };
    return { score, label: "Strong" };
  }, [newPassword]);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const queryToken = new URLSearchParams(search).get("token") || "";
    setToken(queryToken);
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!token.trim()) {
      toast.error(AUTH_COPY.RESET_TOKEN_REQUIRED);
      return;
    }

    if (newPassword.length < 8) {
      toast.error(AUTH_COPY.RESET_PASSWORD_MIN_LENGTH);
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
        throw new Error(data?.message || AUTH_COPY.RESET_PASSWORD_FAILED);
      }

      toast.success(data?.message || AUTH_COPY.RESET_PASSWORD_SUCCESS);
      setNewPassword("");
    } catch (error) {
      toast.error(normalizeAuthErrorMessage(error?.message, AUTH_COPY.RESET_PASSWORD_FAILED));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 sm:py-14">
      <Card className="w-full max-w-md animate-rise border border-slate-200/70 bg-white/95 shadow-[0_20px_60px_rgba(2,31,72,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-2xl text-slate-900 dark:text-white">Reset password</CardTitle>
          <CardDescription className="text-slate-600 dark:text-neutral-300">Enter your reset token and a new secure password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2.5">
              <label htmlFor="token" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Reset token</label>
              <Input
                id="token"
                placeholder="Reset token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-neutral-200">New password</label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="pr-10 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
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

              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.score <= 1
                        ? "w-1/4 bg-red-500"
                        : passwordStrength.score <= 3
                          ? "w-2/4 bg-amber-500"
                          : "w-full bg-emerald-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-300">Password strength: {passwordStrength.label}</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-[0.99]"
              disabled={submitting}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : "Reset password"}
            </Button>

            <p className="text-xs text-slate-500 dark:text-neutral-300">We never share your data.</p>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-neutral-300">
            Back to <Link className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200" href="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
