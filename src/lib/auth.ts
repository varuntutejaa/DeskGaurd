import { useEffect, useState } from "react";

export type Role = "student" | "admin";

export interface AuthUser {
  email: string;
  role: Role;
}

/* ── Hardcoded user database ── */
const USERS: { email: string; password: string; role: Role }[] = [
  { email: "student@muj.manipal.edu", password: "1234567890", role: "student" },
  { email: "admin@muj.manipal.edu",   password: "0987654321", role: "admin"   },
];

export function validateCredentials(email: string, password: string): AuthUser | null {
  const match = USERS.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );
  return match ? { email: match.email, role: match.role } : null;
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
