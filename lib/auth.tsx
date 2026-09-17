"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  profileImage?: string;
  role: "customer" | "moderator" | "content_admin" | "super_admin";
  createdAt: string;
}

interface AuthValue {
  user: AppUser | null;
  ready: boolean;
  register: (data: { fullName: string; email: string; phone: string; password: string }) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string; role?: string };
  logout: () => void;
  updateProfile: (data: Partial<AppUser>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

const USERS_KEY = "gws_users"; // { email, password, ...AppUser }[]
const SESSION_KEY = "gws_session"; // email of logged-in user

const DEFAULT_ADMIN = {
  fullName: "Abdulazizbek Orifjonov",
  email: "admin@grandwatch.uz",
  phone: "+998901234567",
  password: "admin123",
  role: "super_admin" as const,
};

function loadUsers(): (AppUser & { password: string })[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seeded = [
    { id: "admin_1", createdAt: new Date().toISOString(), ...DEFAULT_ADMIN },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveUsers(users: (AppUser & { password: string })[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const users = loadUsers();
    const sessionEmail = localStorage.getItem(SESSION_KEY);
    if (sessionEmail) {
      const found = users.find((u) => u.email === sessionEmail);
      if (found) {
        const { password: _password, ...rest } = found;
        setUser(rest);
      }
    }
    setReady(true);
  }, []);

  const register = useCallback(
    (data: { fullName: string; email: string; phone: string; password: string }) => {
      const users = loadUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, error: "Bu email allaqachon ro'yxatdan o'tgan." };
      }
      const newUser: AppUser & { password: string } = {
        id: "u_" + Date.now(),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: "customer",
        password: data.password,
        createdAt: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      saveUsers(updated);
      localStorage.setItem(SESSION_KEY, newUser.email);
      const { password: _password, ...rest } = newUser;
      setUser(rest);
      return { ok: true };
    },
    []
  );

  const login = useCallback((email: string, password: string) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "Email yoki parol noto'g'ri." };
    localStorage.setItem(SESSION_KEY, found.email);
    const { password: _password, ...rest } = found;
    setUser(rest);
    return { ok: true, role: found.role };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<AppUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      const users = loadUsers();
      const idx = users.findIndex((u) => u.email === prev.email);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...data };
        saveUsers(users);
        if (data.email) localStorage.setItem(SESSION_KEY, data.email);
      }
      return updated;
    });
  }, []);

  const isAdmin = !!user && ["moderator", "content_admin", "super_admin"].includes(user.role);

  return (
    <AuthContext.Provider value={{ user, ready, register, login, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
