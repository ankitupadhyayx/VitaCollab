"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AUTH_COPY, normalizeAuthErrorMessage } from "@/lib/auth-feedback";
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
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const passwordStrength = useMemo(() => {
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
  }, [form.password]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!form.profileImage) {
      setImagePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(form.profileImage);
    setImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [form.profileImage]);

  const clearProfileImage = () => {
    update("profileImage", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setInlineError("");
    setVerificationMessage("");

    if (!form.role) {
      setInlineError(AUTH_COPY.SIGNUP_ROLE_REQUIRED);
      return;
    }

    if (!form.name.trim()) {
      setInlineError(AUTH_COPY.SIGNUP_NAME_REQUIRED);
      return;
    }

    if (!hasValidEmail) {
      setInlineError(AUTH_COPY.INVALID_EMAIL);
      return;
    }

    if (passwordStrength.score < 2) {
      setInlineError(AUTH_COPY.SIGNUP_PASSWORD_WEAK);
      return;
    }

    if (!acceptedTerms) {
      setInlineError(AUTH_COPY.SIGNUP_TERMS_REQUIRED);
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
          : AUTH_COPY.SIGNUP_SUCCESS
      );
      setVerificationMessage(AUTH_COPY.SIGNUP_SUCCESS);
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      const firstValidationError = error?.response?.data?.errors?.[0]?.message;
      const message = normalizeAuthErrorMessage(
        firstValidationError || error?.response?.data?.message,
        AUTH_COPY.SIGNUP_FAILED
      );
      setInlineError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 sm:py-14">
      <Card className="w-full max-w-2xl animate-rise border border-slate-200/70 bg-white/95 shadow-[0_20px_60px_rgba(2,31,72,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-2xl text-slate-900 dark:text-white">Create your VitaCollab account</CardTitle>
          <CardDescription className="text-slate-600 dark:text-neutral-300">Trusted onboarding for patients and hospitals.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <section className="rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-neutral-100">Section 1: Account</p>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-neutral-200">Choose your role</label>
                <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => update("role", "patient")}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    form.role === "patient"
                      ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                      : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => update("role", "hospital")}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    form.role === "hospital"
                      ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                      : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  }`}
                >
                  Hospital
                </button>
              </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2.5 sm:col-span-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Full name</label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    autoFocus
                    className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                  />
                </div>

                <div className="space-y-2.5 sm:col-span-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Email</label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      autoComplete="email"
                      aria-invalid={!hasValidEmail && form.email.length > 0}
                      className="pr-10 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                    />
                    {hasValidEmail ? <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" /> : null}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">We never share your data.</p>
                </div>

                <div className="space-y-2.5 sm:col-span-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={form.password}
                      onChange={(event) => update("password", event.target.value)}
                      autoComplete="new-password"
                      className="pr-10 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
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
                    <p className="text-xs text-slate-500 dark:text-neutral-400">Password strength: {passwordStrength.label}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-neutral-100">Section 2: Profile</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2.5 sm:col-span-2">
                  <label htmlFor="profileImage" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Profile image</label>

                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10 sm:flex-row sm:items-center">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 dark:border-neutral-600 dark:bg-neutral-800">
                      {imagePreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreviewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="h-8 w-8 text-slate-500 dark:text-neutral-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <Input
                        ref={fileInputRef}
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={(event) => update("profileImage", event.target.files?.[0] || null)}
                        className="bg-white/80 border-slate-300 text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white file:cursor-pointer focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white"
                      />

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-lg"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" /> Change
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-lg"
                          onClick={clearProfileImage}
                          disabled={!form.profileImage}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {form.role === "patient" ? (
                  <>
                    <div className="space-y-2.5">
                      <label htmlFor="age" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Age</label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={form.age}
                        onChange={(event) => update("age", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label htmlFor="gender" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Gender</label>
                      <select
                        id="gender"
                        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white"
                        value={form.gender}
                        onChange={(event) => update("gender", event.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label htmlFor="bloodGroup" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Blood group</label>
                      <select
                        id="bloodGroup"
                        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white"
                        value={form.bloodGroup}
                        onChange={(event) => update("bloodGroup", event.target.value)}
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Phone</label>
                      <Input
                        id="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>
                  </>
                ) : null}

                {form.role === "hospital" ? (
                  <>
                    <div className="space-y-2.5 sm:col-span-2">
                      <label htmlFor="hospitalName" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Hospital name</label>
                      <Input
                        id="hospitalName"
                        placeholder="Hospital name"
                        value={form.hospitalName}
                        onChange={(event) => update("hospitalName", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="licenseNumber" className="text-sm font-medium text-slate-700 dark:text-neutral-200">License number</label>
                      <Input
                        id="licenseNumber"
                        placeholder="License number"
                        value={form.licenseNumber}
                        onChange={(event) => update("licenseNumber", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="specialization" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Specialization</label>
                      <Input
                        id="specialization"
                        placeholder="Specialization"
                        value={form.specialization}
                        onChange={(event) => update("specialization", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Address</label>
                      <Input
                        id="address"
                        placeholder="Address"
                        value={form.address}
                        onChange={(event) => update("address", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="hospitalPhone" className="text-sm font-medium text-slate-700 dark:text-neutral-200">Phone</label>
                      <Input
                        id="hospitalPhone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        className="bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-white/10 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-400"
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border border-slate-400 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-500 dark:bg-neutral-800"
              />
              <span>
                I agree to the <Link href="/terms" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Terms</Link> and <Link href="/privacy" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Privacy Policy</Link>.
              </span>
            </label>

            {inlineError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-900/20 dark:text-red-300" role="alert">
                {inlineError}
              </p>
            ) : null}

            {verificationMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-300" role="status">
                {verificationMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.99]"
              disabled={submitting}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-neutral-300">
            Already have an account? <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" href="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
