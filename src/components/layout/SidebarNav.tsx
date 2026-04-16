"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, LayoutDashboard, Clock3, BookText } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/event-types", label: "Event Types", icon: CalendarDays },
  { href: "/availability", label: "Availability", icon: Clock3 },
  { href: "/bookings", label: "Bookings", icon: BookText },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-zinc-200 bg-white md:w-72 md:shrink-0 md:border-r md:border-b-0">
      <div className="px-4 py-4 md:px-5 md:py-6">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Scheduling
        </div>
        <div className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
          Cal Clone
        </div>
        <nav className="mt-6 grid gap-1.5">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm transition ${
                  pathname === l.href
                    ? "text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {pathname === l.href ? (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 -z-10 rounded-xl border border-zinc-200 bg-zinc-100"
                    transition={{ type: "spring", stiffness: 450, damping: 34 }}
                  />
                ) : null}
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

