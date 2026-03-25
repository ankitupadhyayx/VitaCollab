"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { getCurrentUser, loginUser, logoutUser, refreshAuth, registerUser } from "@/services/auth.service";
import { setAccessTokenInMemory } from "@/lib/session-store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  const updateSession = useCallback((session) => {
    const token = session?.accessToken || null;
    setAccessToken(token);
    setAccessTokenInMemory(token);
    setUser(session?.user || null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    const runRefreshAttempt = async (attempt = 0) => {
      try {
        return await refreshAuth();
      } catch (error) {
        const status = Number(error?.response?.status || 0);
        const isRetryable = !status || status >= 500;
        if (attempt < 1 && isRetryable) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          return runRefreshAttempt(attempt + 1);
        }
        throw error;
      }
    };

    try {
      const refreshed = await runRefreshAttempt();
      updateSession(refreshed?.data);

      const profile = await getCurrentUser();
      setUser(profile?.data?.user || null);
    } catch (error) {
      setAccessTokenInMemory(null);
      setAccessToken(null);
      setUser(null);
    } finally {
      setHasBootstrapped(true);
      setIsLoading(false);
    }
  }, [updateSession]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    const onSessionExpired = () => {
      if (hasBootstrapped) {
        setSessionExpired(true);
      }
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
  }, [hasBootstrapped, updateSession]);

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload);
    updateSession(response?.data);
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
    (nextSession) => {
      if (typeof nextSession === "function") {
        const resolved = nextSession({ user, accessToken });
        updateSession(resolved);
        return;
      }

      updateSession(nextSession);
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
