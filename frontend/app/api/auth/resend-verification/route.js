import { NextResponse } from "next/server";
import { AUTH_COPY } from "@/lib/auth-feedback";
import { resolveServerApiBaseUrl } from "@/lib/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ message: AUTH_COPY.EMAIL_REQUIRED }, { status: 400 });
    }

    const response = await fetch(`${resolveServerApiBaseUrl()}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || AUTH_COPY.RESEND_VERIFICATION_FAILED },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: data?.message || AUTH_COPY.RESEND_VERIFICATION_SUCCESS });
  } catch (error) {
    return NextResponse.json({ message: AUTH_COPY.RESEND_VERIFICATION_FAILED }, { status: 500 });
  }
}
