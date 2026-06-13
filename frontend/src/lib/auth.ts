import { useEffect, useState } from "react";
import { api } from "./api";

export type Role = "student" | "admin";

export interface AuthUser {
  email: string;
  role: Role;
}

export async function validateCredentials(email: string, password: string): Promise<AuthUser | null> {
  try {
    return await api.login(email, password);
  } catch {
    return null;
  }
}

/* ── Session persistence ── */
const KEY   = "deskguard.auth";
const EVENT = "deskguard-auth-change";

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVENT));
}

export function clearUser() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive hook — re-renders when session changes. */
export function useAuth(): AuthUser | null {
  const [user, setState] = useState<AuthUser | null>(() => getUser());
  useEffect(() => {
    const sync = () => setState(getUser());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return user;
}
