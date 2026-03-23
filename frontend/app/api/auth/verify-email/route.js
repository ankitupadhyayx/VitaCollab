import { AUTH_COPY } from "@/lib/auth-feedback";
import { resolveServerApiBaseUrl } from "@/lib/api";

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";

    if (!token) {
      return Response.json(
        { success: false, message: AUTH_COPY.VERIFY_TOKEN_REQUIRED },
        { status: 400 }
      );
    }

    const apiBaseUrl = resolveServerApiBaseUrl();
    const verifyUrl = `${apiBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const response = await fetch(verifyUrl, {
      method: "GET",
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message: payload?.message || AUTH_COPY.VERIFY_INVALID_OR_EXPIRED
        },
        { status: response.status }
      );
    }

    return Response.json(
      {
        success: true,
        message: payload?.message || AUTH_COPY.VERIFY_SUCCESS
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: AUTH_COPY.VERIFY_FAILED
      },
      { status: 500 }
    );
  }
}
