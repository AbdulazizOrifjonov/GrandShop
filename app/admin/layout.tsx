"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex bg-navy-50 min-h-screen">
        <AdminSidebar />
        <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">{children}</main>
      </div>
    </AdminGuard>
  );
}
