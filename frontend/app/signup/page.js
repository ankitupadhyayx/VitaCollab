"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();

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
      router.push("/login");
    } catch (error) {
      const firstValidationError = error?.response?.data?.errors?.[0]?.message;
      toast.error(firstValidationError || error?.response?.data?.message || "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Card className="w-full max-w-md animate-rise">
        <CardHeader>
          <CardTitle>Create your VitaCollab account</CardTitle>
          <CardDescription>Own your records and approve every update.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input placeholder="Full name" value={form.name} onChange={(event) => update("name", event.target.value)} />
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={(event) => update("email", event.target.value)} />
            <Input type="password" placeholder="Create password" value={form.password} onChange={(event) => update("password", event.target.value)} />
            <select
              className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              value={form.role}
              onChange={(event) => update("role", event.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="hospital">Hospital / Doctor</option>
            </select>
            <Input type="file" accept="image/*" onChange={(event) => update("profileImage", event.target.files?.[0] || null)} />

            {form.role === "patient" ? (
              <>
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
              </>
            ) : null}

            {form.role === "hospital" ? (
              <>
                <Input placeholder="Hospital name" value={form.hospitalName} onChange={(event) => update("hospitalName", event.target.value)} />
                <Input placeholder="License number" value={form.licenseNumber} onChange={(event) => update("licenseNumber", event.target.value)} />
                <Input placeholder="Specialization" value={form.specialization} onChange={(event) => update("specialization", event.target.value)} />
                <Input placeholder="Address" value={form.address} onChange={(event) => update("address", event.target.value)} />
                <Input placeholder="Phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
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
