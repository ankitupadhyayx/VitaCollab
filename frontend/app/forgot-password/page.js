"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AUTH_COPY, normalizeAuthErrorMessage } from "@/lib/auth-feedback";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!email.trim()) {
        toast.error(AUTH_COPY.EMAIL_REQUIRED);
        return;
      }

      setSubmitting(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || AUTH_COPY.FORGOT_PASSWORD_FAILED);
      }

      toast.success(data?.message || AUTH_COPY.FORGOT_PASSWORD_SUCCESS);
    } catch (error) {
      toast.error(normalizeAuthErrorMessage(error?.message, AUTH_COPY.FORGOT_PASSWORD_FAILED));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 sm:py-14">
      <Card className="w-full max-w-md animate-rise border border-slate-200/70 bg-white/95 shadow-[0_20px_60px_rgba(2,31,72,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-2xl text-slate-900 dark:text-white">Forgot password</CardTitle>
          <CardDescription className="text-slate-600 dark:text-neutral-300">We will send a secure reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-[0.99]"
              disabled={submitting}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : "Send reset link"}
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
