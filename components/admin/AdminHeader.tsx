"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  moderator: "Moderator",
  content_admin: "Kontent admin",
  customer: "Mijoz",
};

export function AdminHeader({
  title,
  subtitle,
  searchPlaceholder = "Qidirish...",
}: {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
}) {
  const { user } = useAuth();

  return (
    <header className="flex h-[76px] items-center gap-4 border-b border-navy-100 bg-white px-4 lg:px-6">
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-navy-900 text-responsive-base">{title}</p>
        <p className="truncate text-xs text-navy-900/50 text-responsive-base">{subtitle ?? "Do'koningizni boshqaring va rivojlantiring"}</p>
      </div>

      <div className="hidden md:flex max-w-sm flex-1 items-center gap-2 rounded-full bg-navy-50 px-4 py-2.5">
        <Search size={16} className="text-navy-900/40" />
        <input placeholder={searchPlaceholder} className="w-full bg-transparent text-sm outline-none placeholder:text-navy-900/40 input-touch" />
      </div>

      <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-navy-50 touch-target">
        <Bell size={18} />
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">5</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white touch-target">
          {user?.fullName?.slice(0, 1) ?? "A"}
        </div>
        <div className="hidden md:block text-sm">
          <p className="font-medium text-navy-900 text-responsive-base">{user?.fullName ?? "Admin"}</p>
          <p className="text-xs text-navy-900/50 text-responsive-base">{ROLE_LABEL[user?.role ?? "super_admin"]}</p>
        </div>
      </div>
    </header>
  );
}