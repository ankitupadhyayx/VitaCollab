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

export default function SignupPage() {
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    age: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    hospitalName: "",
    licenseNumber: "",
    specialization: "",
    address: "",
    profileImage: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const passwordStrength = (() => {
    const value = form.password;
    if (!value) return { score: 0, label: "Add a strong password" };

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return { score, label: "Weak" };
    if (score <= 3) return { score, label: "Moderate" };
    return { score, label: "Strong" };
  })();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setInlineError("");
    setVerificationMessage("");

    if (!form.role) {
      setInlineError("Select a role to continue.");
      return;
    }

    if (!form.name.trim()) {
      setInlineError("Full name is required.");
      return;
    }

    if (!hasValidEmail) {
      setInlineError("Enter a valid email address.");
      return;
    }

    if (passwordStrength.score < 2) {
      setInlineError("Use a stronger password with uppercase letters, numbers, and symbols.");
      return;
    }

    if (!acceptedTerms) {
      setInlineError("Please accept the terms and privacy policy.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        profileImage: form.profileImage,
        phone: form.phone
      };

      if (form.role === "patient") {
        payload.age = form.age;
        payload.gender = form.gender;
        payload.bloodGroup = form.bloodGroup;
      }

      if (form.role === "hospital") {
        payload.hospitalName = form.hospitalName;
        payload.licenseNumber = form.licenseNumber;
        payload.specialization = form.specialization;
        payload.address = form.address;
      }

      const response = await register(payload);
      const previewToken = response?.data?.verificationPreviewToken;
      toast.success(
        previewToken
          ? `Registered. Dev verify token: ${previewToken.slice(0, 12)}...`
          : "Registered successfully. Check your email to verify account."
      );
      setVerificationMessage("Account created. A verification link has been sent to your email address.");
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      const firstValidationError = error?.response?.data?.errors?.[0]?.message;
      const message = firstValidationError || error?.response?.data?.message || "Unable to create account";
      setInlineError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-12">
      <Card className="w-full max-w-xl animate-rise border-slate-200 bg-white shadow-[0_20px_60px_rgba(2,31,72,0.12)]">
        <CardHeader>
          <CardTitle className="text-2xl">Create your VitaCollab account</CardTitle>
          <CardDescription>Trusted onboarding for patients and hospitals.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Choose your role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => update("role", "patient")}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    form.role === "patient"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => update("role", "hospital")}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    form.role === "hospital"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
                  }`}
                >
                  Hospital
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</label>
              <Input id="name" placeholder="Full name" value={form.name} onChange={(event) => update("name", event.target.value)} autoFocus />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  autoComplete="email"
                  aria-invalid={!hasValidEmail && form.email.length > 0}
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
                placeholder="Create password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                autoComplete="new-password"
              />
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.score <= 1
                        ? "w-1/4 bg-red-400"
                        : passwordStrength.score <= 3
                          ? "w-2/4 bg-amber-400"
                          : "w-full bg-emerald-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500">Password strength: {passwordStrength.label}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="profileImage" className="text-sm font-medium text-slate-700">Profile image (optional)</label>
              <Input id="profileImage" type="file" accept="image/*" onChange={(event) => update("profileImage", event.target.files?.[0] || null)} />
            </div>

            {form.role === "patient" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input type="number" placeholder="Age" value={form.age} onChange={(event) => update("age", event.target.value)} />
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  value={form.gender}
                  onChange={(event) => update("gender", event.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  value={form.bloodGroup}
                  onChange={(event) => update("bloodGroup", event.target.value)}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <Input placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </div>
            ) : null}

            {form.role === "hospital" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Hospital name" value={form.hospitalName} onChange={(event) => update("hospitalName", event.target.value)} />
                <Input placeholder="License number" value={form.licenseNumber} onChange={(event) => update("licenseNumber", event.target.value)} />
                <Input placeholder="Specialization" value={form.specialization} onChange={(event) => update("specialization", event.target.value)} />
                <Input placeholder="Address" value={form.address} onChange={(event) => update("address", event.target.value)} />
                <Input placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </div>
            ) : null}

            <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary"
              />
              <span>
                I agree to the <Link href="/terms" className="font-semibold text-primary">Terms</Link> and <Link href="/privacy" className="font-semibold text-primary">Privacy Policy</Link>.
              </span>
            </label>

            {inlineError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {inlineError}
              </p>
            ) : null}

            {verificationMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
                {verificationMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link className="font-semibold text-primary" href="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
