"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  profileImage?: string;
  role: "user" | "admin" | "super_admin";
  createdAt: string;
}

interface AuthValue {
  user: AppUser | null;
  ready: boolean;
  login: (fullName: string, phone: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

const SESSION_KEY = "gws_session_id"; // store the user id

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSession() {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const { data, error } = await supabase.from("app_users").select("*").eq("id", sessionId).single();
        if (data && !error) {
          setUser({ id: data.id, fullName: data.full_name, phone: data.phone, role: data.role, createdAt: data.created_at });
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setReady(true);
    }
    loadSession();
  }, [supabase]);

  const login = useCallback(async (fullName: string, phone: string, password?: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const isAdminLogin = cleanPhone === "+998977657180";
    
    if (isAdminLogin && password !== "GRANDWATCHSHOP") return { ok: false, error: "Parol noto'g'ri!" };

    const { data: existing } = await supabase.from("app_users").select("*").eq("phone", cleanPhone).single();

    if (existing) {
      const userData: AppUser = { id: existing.id, fullName: existing.full_name, phone: existing.phone, role: existing.role, createdAt: existing.created_at };
      if (existing.full_name !== fullName) {
        await supabase.from("app_users").update({ full_name: fullName }).eq("id", existing.id);
        userData.fullName = fullName;
      }
      if (isAdminLogin && existing.role !== 'admin') {
        await supabase.from("app_users").update({ role: 'admin' }).eq("id", existing.id);
        userData.role = 'admin';
      }
      setUser(userData);
      localStorage.setItem(SESSION_KEY, userData.id);
      return { ok: true };
    } else {
      const { data: newUser, error: insertError } = await supabase.from("app_users").insert({
          full_name: fullName, phone: cleanPhone, role: isAdminLogin ? 'admin' : 'user', password: password || null
        }).select().single();

      if (insertError || !newUser) return { ok: false, error: "Tizimga kirishda xatolik yuz berdi." };
      const userData: AppUser = { id: newUser.id, fullName: newUser.full_name, phone: newUser.phone, role: newUser.role, createdAt: newUser.created_at };
      setUser(userData);
      localStorage.setItem(SESSION_KEY, userData.id);
      return { ok: true };
    }
  }, [supabase]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<AppUser>) => {
    setUser((prev) => { if (!prev) return prev; return { ...prev, ...data }; });
    if (user?.id) {
      const updateData: any = {};
      if (data.fullName) updateData.full_name = data.fullName;
      if (data.phone) updateData.phone = data.phone;
      if (Object.keys(updateData).length > 0) await supabase.from("app_users").update(updateData).eq("id", user.id);
    }
  }, [user, supabase]);

  const isAdmin = !!user && ["admin", "super_admin"].includes(user.role);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
