import { NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!base) {
    throw new Error("API URL is not configured");
  }

  return base.replace(/\/$/, "");
};

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const response = await fetch(`${getBackendBaseUrl()}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Unable to process request" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data?.message || "If your email exists, a reset link was sent" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to process forgot password request" }, { status: 500 });
  }
}
