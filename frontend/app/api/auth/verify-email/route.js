import { AUTH_COPY } from "@/lib/auth-feedback";

const API_VERSION_PREFIX = "/api/v1";

const normalizeApiBaseUrl = (url) => (url || "").trim().replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const raw =
    normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
    normalizeApiBaseUrl(process.env.API_BASE_URL);

  if (!raw) {
    throw new Error("Missing NEXT_PUBLIC_API_URL or API_BASE_URL environment variable.");
  }

  return raw.endsWith(API_VERSION_PREFIX) ? raw : `${raw}${API_VERSION_PREFIX}`;
};

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get("token") || "";

    if (!token) {
      return Response.json(
        { success: false, message: AUTH_COPY.VERIFY_TOKEN_REQUIRED },
        { status: 400 }
      );
    }

    const apiBaseUrl = resolveApiBaseUrl();
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
