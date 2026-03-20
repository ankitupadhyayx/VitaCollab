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
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Token and new password are required" }, { status: 400 });
    }

    const response = await fetch(`${getBackendBaseUrl()}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Unable to reset password" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data?.message || "Password reset successful" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to reset password" }, { status: 500 });
  }
}
