"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "../services/auth.service";
import type { LoginPayload, RegistrationPayload, User } from "../types";

/** Owns the browser session state without duplicating server authorization rules. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Establishes the current account when the app shell first mounts. */
  useEffect(() => {
    let active = true;
    authService.currentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  /** Logs in and updates the shell only after the server accepts the credentials. */
  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);
    try {
      const authenticatedUser = await authService.login(payload);
      setUser(authenticatedUser);
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Sign in failed.";
      setError(message);
      throw loginError;
    }
  }, []);

  /** Logs out through the service and clears local session state. */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const register = useCallback(async (payload: RegistrationPayload) => {
    setError(null);
    try {
      const registeredUser = await authService.register(payload);
      setUser(registeredUser);
    } catch (registrationError) {
      const message = registrationError instanceof Error ? registrationError.message : "Registration failed.";
      setError(message);
      throw registrationError;
    }
  }, []);

  return { user, isLoading, error, login, register, logout, setUser };
}
