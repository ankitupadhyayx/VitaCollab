import { NextResponse } from "next/server";

const API_VERSION_PREFIX = "/api/v1";

const normalizeApiBaseUrl = (url) => (url || "").trim().replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const raw =
    normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
    normalizeApiBaseUrl(process.env.API_URL);

  if (!raw) {
    throw new Error("API URL is not configured");
  }

  return raw.endsWith(API_VERSION_PREFIX) ? raw : `${raw}${API_VERSION_PREFIX}`;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Token and new password are required" }, { status: 400 });
    }

    const response = await fetch(`${resolveApiBaseUrl()}/auth/reset-password`, {
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
