"use client";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh)] text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1300px] flex-col md:flex-row">
        <SidebarNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-10">
          <TopBar />
          {children}
        </main>
      </div>
    </div>
  );
}

