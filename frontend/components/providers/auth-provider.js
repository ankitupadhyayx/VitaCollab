"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, refreshAuth, registerUser } from "@/services/auth.service";
import { getStoredAccessToken, setStoredAccessToken } from "@/lib/session-store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateSession = useCallback((session) => {
    const token = session?.accessToken || null;
    setAccessToken(token);
    setStoredAccessToken(token);
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

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      logout,
      setSession: updateSession
    }),
    [user, accessToken, isLoading, login, register, logout, updateSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
