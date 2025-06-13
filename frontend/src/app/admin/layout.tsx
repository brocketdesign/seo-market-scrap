'use client';

import { SessionProvider } from "@/lib/auth/mock-auth";
import { Inter } from "next/font/google";
import AdminSidebar from "@/components/layout/AdminSidebar";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className={`${inter.className} min-h-screen bg-gray-50 flex`}>
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
