"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { getCurrentUser, loginUser, logoutUser, refreshAuth, registerUser } from "@/services/auth.service";
import { getRememberSession, getStoredAccessToken, setRememberSession, setStoredAccessToken } from "@/lib/session-store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const updateSession = useCallback((session, options = {}) => {
    const token = session?.accessToken || null;
    const remember = typeof options.remember === "boolean" ? options.remember : getRememberSession();
    setAccessToken(token);
    setStoredAccessToken(token, remember);
    setUser(session?.user || null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    const cachedToken = getStoredAccessToken();

    if (cachedToken) {
      setAccessToken(cachedToken);
    }

    try {
      if (!cachedToken) {
        const refreshed = await refreshAuth();
        updateSession(refreshed?.data);
      }

      const profile = await getCurrentUser();
      setUser(profile?.data?.user || null);
    } catch (error) {
      setStoredAccessToken(null);
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    const onSessionExpired = () => {
      setSessionExpired(true);
      updateSession(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("vitacollab:session-expired", onSessionExpired);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("vitacollab:session-expired", onSessionExpired);
      }
    };
  }, [updateSession]);

  const login = useCallback(async (payload) => {
    const remember = payload?.rememberMe !== false;
    setRememberSession(remember);
    const response = await loginUser(payload);
    updateSession(response?.data, { remember });
    return response;
  }, [updateSession]);

  const register = useCallback(async (payload) => registerUser(payload), []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      updateSession(null);
    }
  }, [updateSession]);

  const setSession = useCallback(
    (nextSession, options = {}) => {
      if (typeof nextSession === "function") {
        const resolved = nextSession({ user, accessToken });
        updateSession(resolved, options);
        return;
      }

      updateSession(nextSession, options);
    },
    [user, accessToken, updateSession]
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      logout,
      setSession
    }),
    [user, accessToken, isLoading, login, register, logout, setSession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Modal
        open={sessionExpired}
        title="Session expired"
        description="For security reasons, please sign in again to continue."
        onClose={() => setSessionExpired(false)}
      >
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSessionExpired(false);
              router.push("/login");
            }}
          >
            Go to Sign In
          </Button>
        </div>
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
