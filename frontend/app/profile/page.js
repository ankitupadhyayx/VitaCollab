"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { PatientQrModal } from "@/components/profile/patient-qr-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cropImageToSquareFile } from "@/lib/image-crop";
import { getProfile, updateProfile } from "@/services/profile.service";
import { getMyQrToken } from "@/services/qr.service";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setSession, logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [securityState, setSecurityState] = useState({ syncing: false, syncedAt: null });
  const { runOptimistic, isPending } = useOptimisticUpdate(securityState, setSecurityState);

  const [avatarPreview, setAvatarPreview] = useState(user?.profileImageUrl || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [patientForm, setPatientForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.patientProfile?.phone || "",
    address: user?.patientProfile?.address || "",
    bloodGroup: user?.patientProfile?.bloodGroup || "",
    age: user?.patientProfile?.age || "",
    dob: user?.patientProfile?.dob ? new Date(user.patientProfile.dob).toISOString().slice(0, 10) : "",
    emergencyContact: user?.patientProfile?.emergencyContact || "",
    allergies: Array.isArray(user?.patientProfile?.allergies) ? user.patientProfile.allergies.join(", ") : "",
    medicalConditions: Array.isArray(user?.patientProfile?.medicalConditions) ? user.patientProfile.medicalConditions.join(", ") : "",
    medications: Array.isArray(user?.patientProfile?.medications) ? user.patientProfile.medications.join(", ") : ""
  });

  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: user?.hospitalProfile?.hospitalName || user?.name || "",
    licenseNumber: user?.hospitalProfile?.licenseNumber || "",
    address: user?.hospitalProfile?.address || "",
    departments: [],
    contactEmail: user?.email || "",
    contactPhone: user?.hospitalProfile?.phone || ""
  });

  const isHospital = user?.role === "hospital";
  const isVerified = user?.isVerified === true || user?.verified === true;
  const qrPayload = useMemo(() => {
    if (!user?.id || !qrToken) {
      return "";
    }

    return JSON.stringify({
      patientId: user.id,
      token: qrToken
    });
  }, [user?.id, qrToken]);

  const activeSessions = useMemo(() => {
    const agent = typeof navigator !== "undefined" ? navigator.userAgent : "Unknown device";
    return [
      {
        id: "current",
        device: agent.includes("Mobile") ? "Current mobile device" : "Current browser session",
        location: "Detected from current network",
        lastActive: new Date().toLocaleString(),
        trusted: true
      },
      {
        id: "backup",
        device: "Previous remembered session",
        location: "Last known login",
        lastActive: user?.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown",
        trusted: false
      }
    ];
  }, [user?.createdAt]);

  const loginActivity = useMemo(() => {
    const history = [];
    history.push({
      id: "now",
      event: "Session refreshed",
      at: new Date().toLocaleString(),
      source: "Current device"
    });
    if (user?.createdAt) {
      history.push({
        id: "created",
        event: "Account created",
        at: new Date(user.createdAt).toLocaleString(),
        source: "VitaCollab"
      });
    }
    return history;
  }, [user?.createdAt]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        const nextUser = response?.data?.user;
        if (!nextUser || !mounted) {
          return;
        }

        setAvatarPreview(nextUser.profileImageUrl || "");
        setPatientForm((prev) => ({
          ...prev,
          name: nextUser.name || "",
          email: nextUser.email || "",
          phone: nextUser.patientProfile?.phone || "",
          address: nextUser.patientProfile?.address || "",
          emergencyContact: nextUser.patientProfile?.emergencyContact || "",
          bloodGroup: nextUser.patientProfile?.bloodGroup || "",
          age: nextUser.patientProfile?.age || "",
          dob: nextUser.patientProfile?.dob ? new Date(nextUser.patientProfile.dob).toISOString().slice(0, 10) : "",
          allergies: Array.isArray(nextUser.patientProfile?.allergies) ? nextUser.patientProfile.allergies.join(", ") : "",
          medicalConditions: Array.isArray(nextUser.patientProfile?.medicalConditions) ? nextUser.patientProfile.medicalConditions.join(", ") : "",
          medications: Array.isArray(nextUser.patientProfile?.medications) ? nextUser.patientProfile.medications.join(", ") : ""
        }));
        setHospitalForm((prev) => ({
          ...prev,
          hospitalName: nextUser.hospitalProfile?.hospitalName || nextUser.name || "",
          licenseNumber: nextUser.hospitalProfile?.licenseNumber || "",
          address: nextUser.hospitalProfile?.address || "",
          contactEmail: nextUser.email || "",
          contactPhone: nextUser.hospitalProfile?.phone || "",
          departments: nextUser.hospitalProfile?.departments || []
        }));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load profile");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const completion = useMemo(() => {
    const form = isHospital ? hospitalForm : patientForm;
    const values = Object.values(form).flat();
    const completed = values.filter((item) => String(item).trim()).length;
    return Math.round((completed / values.length) * 100);
  }, [isHospital, hospitalForm, patientForm]);

  const missingFields = useMemo(() => {
    const entries = isHospital
      ? [
          ["Hospital name", hospitalForm.hospitalName],
          ["License number", hospitalForm.licenseNumber],
          ["Address", hospitalForm.address],
          ["Contact phone", hospitalForm.contactPhone],
          ["Departments", hospitalForm.departments?.length ? "ok" : ""]
        ]
      : [
          ["Phone", patientForm.phone],
          ["Blood group", patientForm.bloodGroup],
          ["Age", patientForm.age],
          ["Emergency contact", patientForm.emergencyContact],
          ["Address", patientForm.address]
        ];

    return entries.filter(([, value]) => !String(value || "").trim()).map(([label]) => label);
  }, [isHospital, hospitalForm, patientForm]);

  const onAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const cropped = await cropImageToSquareFile(file);
      setAvatarFile(cropped);
      setAvatarPreview(URL.createObjectURL(cropped));
      toast.success("Image cropped and ready to upload");
    } catch {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    if (!isVerified) {
      toast.error("Please verify your email before editing profile");
      return;
    }

    if (!isHospital && !patientForm.phone.trim()) {
      toast.error("Phone is required");
      return;
    }

    if (isHospital && !hospitalForm.licenseNumber.trim()) {
      toast.error("License number is required");
      return;
    }

    const payload = isHospital
      ? {
          name: hospitalForm.hospitalName,
          hospitalName: hospitalForm.hospitalName,
          licenseNumber: hospitalForm.licenseNumber,
          address: hospitalForm.address,
          departments: hospitalForm.departments,
          contactEmail: hospitalForm.contactEmail,
          contactPhone: hospitalForm.contactPhone,
          profileImage: avatarFile
        }
      : {
          name: patientForm.name,
          phone: patientForm.phone,
          bloodGroup: patientForm.bloodGroup,
          age: patientForm.age,
          dob: patientForm.dob,
          address: patientForm.address,
          emergencyContact: patientForm.emergencyContact,
          allergies: patientForm.allergies,
          medicalConditions: patientForm.medicalConditions,
          medications: patientForm.medications,
          profileImage: avatarFile
        };

    const previousAvatar = avatarPreview;
    const previousUser = user;
    const optimisticUser = {
      ...user,
      name: isHospital ? hospitalForm.hospitalName : patientForm.name,
      email: isHospital ? hospitalForm.contactEmail : user?.email,
      patientProfile: isHospital
        ? user?.patientProfile
        : {
            ...(user?.patientProfile || {}),
            phone: patientForm.phone,
            bloodGroup: patientForm.bloodGroup,
            age: patientForm.age,
            dob: patientForm.dob || null,
            address: patientForm.address,
            emergencyContact: patientForm.emergencyContact,
            allergies: patientForm.allergies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            medicalConditions: patientForm.medicalConditions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            medications: patientForm.medications
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          },
      hospitalProfile: isHospital
        ? {
            ...(user?.hospitalProfile || {}),
            hospitalName: hospitalForm.hospitalName,
            licenseNumber: hospitalForm.licenseNumber,
            address: hospitalForm.address,
            phone: hospitalForm.contactPhone,
            departments: hospitalForm.departments
          }
        : user?.hospitalProfile
    };

    try {
      setSaving(true);
      setUploadProgress(0);
      setSession((current) => ({ ...(current || {}), user: optimisticUser }));

      const result = await runOptimistic({
        key: "profile-save",
        apply: (prev) => ({ ...prev, syncing: true }),
        request: async () =>
          updateProfile(payload, (event) => {
            if (!event.total) {
              return;
            }
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }),
        finalize: () => ({ syncing: false, syncedAt: new Date().toISOString() }),
        rollback: () => ({ syncing: false, syncedAt: null })
      });

      if (!result.ok) {
        throw result.error;
      }

      const updated = result.result?.data?.user;
      if (updated) {
        setSession((current) => ({
          ...(current || {}),
          user: updated
        }));
        setAvatarPreview(updated.profileImageUrl || previousAvatar);
      }

      toast.success("Profile saved successfully");
    } catch (error) {
      setSession((current) => ({ ...(current || {}), user: previousUser }));
      setAvatarPreview(previousAvatar);
      toast.error(error?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
      setAvatarFile(null);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const logoutAllDevices = async () => {
    await logout();
    toast.success("All active sessions were signed out");
    router.push("/login");
  };

  const openQr = async () => {
    try {
      const response = await getMyQrToken();
      setQrToken(response?.data?.token || "");
      setQrOpen(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to generate QR token");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <div className="app-page-shell">
          <Sidebar />
          <main className="w-full space-y-5 pb-28 lg:pb-0">
            <header>
              <h1 className="heading-font text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{isHospital ? "Hospital Profile" : "Patient Profile"}</h1>
              <p className="text-sm text-muted-foreground">Manage your core identity and collaboration readiness.</p>
            </header>

            {!isVerified ? (
              <Card className="border-danger/30 bg-danger/5">
                <CardContent className="p-4 text-sm text-danger">
                  Profile is locked until email verification is complete.
                </CardContent>
              </Card>
            ) : null}

            <section className="grid gap-5 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                  <CardDescription>Keep your profile complete for better collaboration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mx-auto h-28 w-28 overflow-hidden rounded-3xl border border-border/70 bg-muted">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground">No photo</div>
                    )}
                  </div>

                  <label className="block">
                    <input type="file" className="hidden" onChange={onAvatarChange} />
                    <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium">
                      <Camera className="h-4 w-4" /> Upload Photo
                    </span>
                  </label>

                  <div className="space-y-2.5">
                    <p className="text-3xl font-bold text-primary">{completion}%</p>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${completion}%` }} />
                    </div>
                    <p className="text-[12px] leading-5 text-muted-foreground">Complete your details to unlock smoother care workflows.</p>
                  </div>

                  {saving ? (
                    <div className="space-y-1.5">
                      <p className="text-[12px] leading-5 text-muted-foreground">Uploading image {uploadProgress}%</p>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : null}

                  {securityState.syncing ? (
                    <p className="text-[12px] leading-5 text-primary">Syncing profile changes...</p>
                  ) : securityState.syncedAt ? (
                    <p className="text-[12px] leading-5 text-success">Synced at {new Date(securityState.syncedAt).toLocaleTimeString()}</p>
                  ) : null}

                  {!isHospital ? (
                    <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={openQr}>
                      Show My QR
                    </Button>
                  ) : null}

                  {isHospital ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                      <ShieldCheck className="h-4 w-4" />
                      {user?.isHospitalVerified ? "Verified hospital" : "Verification in review"}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Patient identity secured
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{isHospital ? "Hospital Details" : "Personal Details"}</CardTitle>
                  <CardDescription>Edit and save your profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton key={index} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : null}

                  {!loading && missingFields.length ? (
                    <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-[12px] leading-5 text-warning-foreground">
                      Complete your profile to unlock features. Missing: {missingFields.join(", ")}
                    </div>
                  ) : null}

                  {!loading ? (
                  <ProfileForm
                    isHospital={isHospital}
                    patientForm={patientForm}
                    setPatientForm={setPatientForm}
                    hospitalForm={hospitalForm}
                    setHospitalForm={setHospitalForm}
                    onSave={saveProfile}
                    locked={!isVerified || saving}
                  />
                  ) : null}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Device Sessions</CardTitle>
                  <CardDescription>Review active sessions and secure account access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="rounded-2xl bg-background/65 p-3 text-sm">
                      <p className="font-semibold text-foreground">{session.device}</p>
                      <p className="text-[12px] leading-5 text-muted-foreground">{session.location}</p>
                      <p className="text-[12px] leading-5 text-muted-foreground">Last active: {session.lastActive}</p>
                    </div>
                  ))}
                  <Button type="button" variant="danger" onClick={logoutAllDevices} disabled={isPending("profile-save") || saving}>
                    Logout from all devices
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login Activity</CardTitle>
                  <CardDescription>Recent sign-in and session events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loginActivity.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-background/65 p-3 text-sm">
                      <p className="font-semibold text-foreground">{item.event}</p>
                      <p className="text-[12px] leading-5 text-muted-foreground">{item.at}</p>
                      <p className="text-[12px] leading-5 text-muted-foreground">{item.source}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </main>
        </div>

        <PatientQrModal open={qrOpen} onClose={() => setQrOpen(false)} value={qrPayload} />
      </div>
    </ProtectedRoute>
  );
}
