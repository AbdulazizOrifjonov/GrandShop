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

export const ADMIN_PHONES = [
  "+998977657180",
  "+998935891969",
  "+998935821774",
];

export function normalizePhone(phone: string): string {
  let clean = phone.replace(/[^\d+]/g, "");
  if (!clean.startsWith("+")) {
    if (clean.startsWith("998")) {
      clean = "+" + clean;
    } else if (clean.length === 9) {
      clean = "+998" + clean;
    } else {
      clean = "+998" + clean;
    }
  }
  return clean;
}

export function isSuperAdminPhone(phone: string): boolean {
  const norm = normalizePhone(phone);
  return ADMIN_PHONES.includes(norm);
}

interface AuthValue {
  user: AppUser | null;
  ready: boolean;
  login: (
    phone: string,
    password?: string,
    fullName?: string
  ) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean; notRegistered?: boolean }>;
  signup: (
    fullName: string,
    phone: string
  ) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean; alreadyRegistered?: boolean }>;
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

  const login = useCallback(
    async (arg1: string, arg2?: string, arg3?: string) => {
      let fullName = "";
      let phone = arg1;
      let password = arg2;

      // Agar birinchi parametr ism bo'lib, ikkinchisi telefon raqam bo'lsa (eski chaqiruvlarni ham qo'llash)
      if (arg1 && arg2 && (arg2.includes("+998") || /^\d{9,12}$/.test(arg2.replace(/\s+/g, "")))) {
        fullName = arg1;
        phone = arg2;
        password = arg3;
      } else if (arg3) {
        fullName = arg3;
      }

      const cleanPhone = normalizePhone(phone);
      const isSuper = isSuperAdminPhone(cleanPhone);

      // 1. Agar Super Admin raqami bo'lsa
      if (isSuper) {
        if (!password || password.trim().toLowerCase() !== "muzaffar") {
          return { ok: false, error: "Admin paroli noto'g'ri!", isAdmin: true };
        }

        const adminName = fullName?.trim() || "Muzaffar";

        const { data: existing } = await supabase
          .from("app_users")
          .select("*")
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (existing) {
          const userData: AppUser = {
            id: existing.id,
            fullName: adminName,
            phone: existing.phone,
            role: "super_admin",
            createdAt: existing.created_at,
          };
          await supabase
            .from("app_users")
            .update({ role: "super_admin", full_name: adminName })
            .eq("id", existing.id);

          setUser(userData);
          localStorage.setItem(SESSION_KEY, userData.id);
          return { ok: true, isAdmin: true };
        } else {
          const { data: newUser, error: insertError } = await supabase
            .from("app_users")
            .insert({
              full_name: adminName,
              phone: cleanPhone,
              role: "super_admin",
              password: password || "GRANDWATCHSHOP",
            })
            .select()
            .single();

          if (insertError || !newUser) {
            return { ok: false, error: "Admin sifatida kirishda xatolik yuz berdi." };
          }
          const userData: AppUser = {
            id: newUser.id,
            fullName: newUser.full_name,
            phone: newUser.phone,
            role: "super_admin",
            createdAt: newUser.created_at,
          };
          setUser(userData);
          localStorage.setItem(SESSION_KEY, userData.id);
          return { ok: true, isAdmin: true };
        }
      }

      // 2. Oddiy foydalanuvchi: faqat oldin ro'yxatdan o'tgan bo'lsa kiritadi!
      const { data: existing, error: queryError } = await supabase
        .from("app_users")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (queryError) {
        return { ok: false, error: "Ma'lumotlar bazasi bilan aloqa xatosi." };
      }

      if (!existing) {
        return {
          ok: false,
          error: "Ushbu telefon raqam ro'yxatdan o'tmagan! Iltimos, 'Ro'yxatdan o'tish' bo'limi orqali hisob oching.",
          notRegistered: true,
        };
      }

      const userData: AppUser = {
        id: existing.id,
        fullName: existing.full_name,
        phone: existing.phone,
        role: existing.role,
        createdAt: existing.created_at,
      };

      setUser(userData);
      localStorage.setItem(SESSION_KEY, userData.id);
      return { ok: true, isAdmin: ["admin", "super_admin"].includes(existing.role) };
    },
    [supabase]
  );

  const signup = useCallback(
    async (fullName: string, phone: string) => {
      const cleanPhone = normalizePhone(phone);
      const isSuper = isSuperAdminPhone(cleanPhone);

      // Telefon raqam oldin ro'yxatdan o'tganligini tekshirish
      const { data: existing } = await supabase
        .from("app_users")
        .select("id, phone, role")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existing) {
        return {
          ok: false,
          error: "Ushbu telefon raqam allaqachon ro'yxatdan o'tgan! Iltimos, 'Kirish' bo'limidan hisobingizga kiring.",
          alreadyRegistered: true,
        };
      }

      const assignedRole = isSuper ? "super_admin" : "user";
      const cleanName = fullName.trim() || (isSuper ? "Muzaffar" : "Foydalanuvchi");

      const { data: newUser, error: insertError } = await supabase
        .from("app_users")
        .insert({
          full_name: cleanName,
          phone: cleanPhone,
          role: assignedRole,
        })
        .select()
        .single();

      if (insertError || !newUser) {
        return {
          ok: false,
          error: "Ro'yxatdan o'tishda xatolik: " + (insertError?.message || ""),
        };
      }

      const userData: AppUser = {
        id: newUser.id,
        fullName: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.created_at,
      };

      setUser(userData);
      localStorage.setItem(SESSION_KEY, userData.id);
      return { ok: true, isAdmin: isSuper };
    },
    [supabase]
  );

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
    <AuthContext.Provider value={{ user, ready, login, signup, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
