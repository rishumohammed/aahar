"use client";
import { useEffect, useRef } from "react";
import { useAuthStore }      from "@/store/authStore";
import { authApi }           from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const validated = useRef(false);

  useEffect(() => {
    // Only validate once per mount, skip if already done
    if (validated.current) return;
    validated.current = true;

    if (!token) return;

    authApi.me()
      .then(res => {
        setAuth(res.data.data, token);
        connectSocket(token);
      })
      .catch(() => {
        clearAuth();
        disconnectSocket();
        // Remove stale cookies
        document.cookie = "aahar-token=; path=/; max-age=0";
        document.cookie = "aahar-role=; path=/; max-age=0";
      });
  }, []);

  // Reconnect socket on token change (page refresh recovery)
  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket(token);
    }
  }, [isAuthenticated, token]);

  const login = async (email: string, password: string) => {
    const res  = await authApi.login(email, password);
    const { user, token } = res.data.data;
    setAuth(user, token);
    // Set cookies for middleware
    document.cookie = `aahar-token=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `aahar-role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    connectSocket(token);
    return user;
  };

  const logout = () => {
    clearAuth();
    disconnectSocket();
    document.cookie = "aahar-token=; path=/; max-age=0";
    document.cookie = "aahar-role=; path=/; max-age=0";
  };

  return { user, token, isAuthenticated, login, logout };
};
