"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

type BookingItem = {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  eventTypeTitle: string;
  isPast: boolean;
};

export function BookingTabs({ bookings }: { bookings: BookingItem[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const filtered = useMemo(
    () => bookings.filter((b) => (tab === "past" ? b.isPast : !b.isPast)),
    [bookings, tab],
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">Bookings Summary</h2>
        <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          <button
            onClick={() => setTab("upcoming")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === "upcoming" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTab("past")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === "past" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
            No {tab} bookings.
          </div>
        ) : (
          filtered.slice(0, 5).map((b) => (
            <div key={b.id} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p className="text-sm font-semibold text-zinc-900">{b.eventTypeTitle}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {format(new Date(b.date), "PPP")} at {b.time}
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                {b.name} · {b.email}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

