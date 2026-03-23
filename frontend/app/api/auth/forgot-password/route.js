import { NextResponse } from "next/server";
import { AUTH_COPY } from "@/lib/auth-feedback";

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
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ message: AUTH_COPY.EMAIL_REQUIRED }, { status: 400 });
    }

    const response = await fetch(`${resolveApiBaseUrl()}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || AUTH_COPY.FORGOT_PASSWORD_FAILED },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data?.message || AUTH_COPY.FORGOT_PASSWORD_SUCCESS });
  } catch (error) {
    return NextResponse.json({ message: AUTH_COPY.FORGOT_PASSWORD_FAILED }, { status: 500 });
  }
}
