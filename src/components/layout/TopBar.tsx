"use client";

import { Search, Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
        <Search className="h-4 w-4 text-zinc-500" />
        <input
          placeholder="Search events or bookings..."
          className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 hover:bg-zinc-50"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            DU
          </div>
          <div className="text-sm text-zinc-700">Default User</div>
        </div>
      </div>
    </header>
  );
}

