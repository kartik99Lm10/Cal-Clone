"use client";

import * as React from "react";
import { toast } from "sonner";
import { format, isBefore } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";

type Booking = {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  eventType: {
    id: string;
    title: string;
    slug: string;
  };
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

function bookingDateTime(b: Booking) {
  return new Date(`${b.date.slice(0, 10)}T${b.time}:00`);
}

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [tab, setTab] = React.useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ bookings: Booking[] }>("/api/bookings");
      setBookings(data.bookings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function onCancel(id: string) {
    setError(null);
    const snapshot = bookings;
    setBookings((list) => list.filter((b) => b.id !== id));

    const promise = api(`/api/bookings/${id}`, { method: "DELETE" }).then(() =>
      refresh(),
    );

    toast.promise(promise, {
      loading: "Cancelling booking…",
      success: "Booking cancelled",
      error: (err) => {
        setBookings(snapshot);
        const msg =
          err instanceof Error ? err.message : "Failed to cancel";
        setError(msg);
        return msg;
      },
    });
  }

  const now = new Date();
  const filtered = bookings.filter((b) =>
    tab === "upcoming"
      ? !isBefore(bookingDateTime(b), now)
      : isBefore(bookingDateTime(b), now),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Meetings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Bookings</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Track upcoming and past meetings.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1">
        <button
          onClick={() => setTab("upcoming")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "upcoming"
              ? "bg-black text-white"
              : "text-zinc-600"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab("past")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "past" ? "bg-black text-white" : "text-zinc-600"
          }`}
        >
          Past
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No {tab} bookings</CardTitle>
            <CardDescription>Bookings will appear here after users schedule.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => (
            <Card key={b.id} className="hover:-translate-y-0.5 hover:border-zinc-300">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-semibold text-zinc-900">{b.eventType.title}</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {format(new Date(b.date), "PPP")} at {b.time}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {b.name} · {b.email}
                  </div>
                </div>
                <Button variant="danger" onClick={() => onCancel(b.id)}>
                  Cancel
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

