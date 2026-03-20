import axios from "axios";
import { logger } from "@/lib/logger";
import { getStoredAccessToken, setStoredAccessToken } from "@/lib/session-store";

const API_VERSION_PREFIX = "/api/v1";

const normalizeApiBaseUrl = (url) => (url || "").trim().replace(/\/+$/, "");

const ensureVersionedApiBaseUrl = (url) => {
  if (url.endsWith(API_VERSION_PREFIX)) {
    return url;
  }

  const withVersion = `${url}${API_VERSION_PREFIX}`;
  console.warn(`[api] NEXT_PUBLIC_API_URL should include ${API_VERSION_PREFIX}. Using ${withVersion} instead.`);
  return withVersion;
};

console.log("API BASE URL:", process.env.NEXT_PUBLIC_API_URL);

export const getApiBaseUrl = () => {
  const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

  if (!apiBaseUrl) {
    console.warn("[api] Missing NEXT_PUBLIC_API_URL. Define it in your environment configuration.");
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable.");
  }

  return ensureVersionedApiBaseUrl(apiBaseUrl);
};

export const toAbsoluteApiUrl = (path = "") => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiOrigin = new URL(getApiBaseUrl()).origin;
  return `${apiOrigin}${sanitizedPath}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (!originalRequest?._networkRetry && (!status || status >= 500)) {
      originalRequest._networkRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 350));
      return api(originalRequest);
    }

    if (status !== 401 || originalRequest?._retry || isAuthRoute) {
      logger.error("API request failed", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: status || 0,
        message: error?.message
      });
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await api.post("/auth/refresh", {});
      const newToken = refreshResponse?.data?.data?.accessToken;

      if (!newToken) {
        throw new Error("Unable to refresh token");
      }

      setStoredAccessToken(newToken);
      onRefreshed(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setStoredAccessToken(null);
      logger.warn("Token refresh failed", {
        message: refreshError?.message,
        status: refreshError?.response?.status || 0
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vitacollab:session-expired"));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
