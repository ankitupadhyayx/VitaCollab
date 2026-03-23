import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { logger } from "@/lib/logger";
import { getStoredAccessToken, setStoredAccessToken } from "@/lib/session-store";

export const getApiBaseUrl = () => {
  return API_BASE_URL;
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
    const requestUrl = String(originalRequest?.url || "");
    const skipRefreshRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/logout",
      "/auth/verify-email",
      "/auth/resend-verification",
      "/auth/forgot-password",
      "/auth/reset-password"
    ];
    const shouldSkipRefresh = skipRefreshRoutes.some((route) => requestUrl.includes(route));

    if (!originalRequest?._networkRetry && (!status || status >= 500)) {
      originalRequest._networkRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 350));
      return api(originalRequest);
    }

    if (status === 429 && !originalRequest?._rateLimitedRetry) {
      originalRequest._rateLimitedRetry = true;
      const retryAfterHeader = Number(error?.response?.headers?.["retry-after"] || 0);
      const retryDelayMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
        ? retryAfterHeader * 1000
        : 5000;

      logger.warn("Rate limited request, backing off", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        retryDelayMs
      });

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      return api(originalRequest);
    }

    if (status !== 401 || originalRequest?._retry || shouldSkipRefresh) {
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
