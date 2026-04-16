"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

type EventType = {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
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

export default function BookSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [slug, setSlug] = React.useState("");
  const [eventType, setEventType] = React.useState<EventType | null>(null);
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = React.useState<string[]>([]);
  const [selectedTime, setSelectedTime] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  React.useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api<{ eventType: EventType }>(
          `/api/public/event-types/${slug}`,
        );
        setEventType(data.eventType);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load event type");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  React.useEffect(() => {
    if (!slug || !date) return;
    (async () => {
      try {
        const data = await api<{ slots: string[] }>(
          `/api/public/event-types/${slug}/slots?date=${date}`,
        );
        setSlots(data.slots);
        if (selectedTime && !data.slots.includes(selectedTime)) {
          setSelectedTime("");
        }
      } catch {
        setSlots([]);
      }
    })();
  }, [slug, date, selectedTime]);

  async function onSubmit() {
    if (!eventType) return;
    setError(null);
    if (!name.trim() || !email.trim() || !date || !selectedTime) {
      setError("Please fill all fields and select a slot");
      return;
    }

    const promise = api<{ booking: { id: string } }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        date,
        time: selectedTime,
        eventTypeId: eventType.id,
      }),
    }).then((data) => {
      router.push(
        `/book/confirmation?bookingId=${data.booking.id}&slug=${eventType.slug}`,
      );
    });

    toast.promise(promise, {
      loading: "Booking your slot…",
      success: "Redirecting to confirmation…",
      error: (e) => {
        const msg =
          e instanceof Error ? e.message : "Failed to create booking";
        setError(msg);
        return msg;
      },
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-red-600">
        Event type not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2"
      >
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Book now</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{eventType.title}</h1>
          {eventType.description ? (
            <p className="mt-2 text-sm text-zinc-500">
              {eventType.description}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-zinc-500">
            {eventType.duration} minutes
          </p>
          <div className="mt-4 space-y-1">
            <label className="text-xs font-medium text-zinc-600">
              Select date
            </label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-zinc-600">
              Available slots
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.length ? (
                slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      selectedTime === slot
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <div className="text-sm text-zinc-500">No slots available for this date.</div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-zinc-900">Your details</h2>
          <div className="mt-4 space-y-3">
            <label className="space-y-1 text-xs font-medium text-zinc-600">
              Name
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="space-y-1 text-xs font-medium text-zinc-600">
              Email
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex justify-end">
            <Button onClick={onSubmit}>Confirm booking</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

