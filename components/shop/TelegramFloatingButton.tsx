"use client";

import { usePathname } from "next/navigation";
import { Send } from "lucide-react";

export function TelegramFloatingButton() {
  const pathname = usePathname();

  // Do not show on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href="https://t.me/+tX9dQIISDYFlYWVi"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Rasmiy Telegram Kanalimiz"
      className="fixed bottom-[74px] md:bottom-6 right-4 z-40 group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0088cc] to-[#2AABEE] text-white p-3 md:px-4 md:py-3 shadow-lg shadow-[#0088cc]/30 hover:shadow-xl hover:shadow-[#0088cc]/45 hover:scale-105 active:scale-95 transition-all duration-300"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300" />
      </span>
      <Send size={18} className="text-white shrink-0 -translate-x-0.5 translate-y-0.5" />
      <span className="hidden md:inline text-xs font-extrabold tracking-wide uppercase">
        Telegram Kanal
      </span>
    </a>
  );
}
