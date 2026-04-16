import Link from "next/link";
import { isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";
import { BookingTabs } from "@/components/dashboard/BookingTabs";

function asDateTime(isoDate: Date, time: string) {
  return new Date(`${isoDate.toISOString().slice(0, 10)}T${time}:00`);
}

export default async function DashboardPage() {
  const [eventTypesCount, availabilityCount, allBookings, eventTypes] = await Promise.all([
    prisma.eventType.count(),
    prisma.availability.count(),
    prisma.booking.findMany({
      include: { eventType: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 8,
    }),
    prisma.eventType.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const now = new Date();
  const upcoming = allBookings.filter((b) => !isBefore(asDateTime(b.date, b.time), now));
  const past = allBookings.filter((b) => isBefore(asDateTime(b.date, b.time), now));
  const tabBookings = allBookings.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    date: b.date.toISOString(),
    time: b.time,
    eventTypeTitle: b.eventType.title,
    isPast: isBefore(asDateTime(b.date, b.time), now),
  }));

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-zinc-200 bg-white px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cal Clone</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your scheduling setup, bookings, and public links.
            </p>
          </div>
          <Link
            href="/event-types"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            New event type
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Event types</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{eventTypesCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Availability slots</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{availabilityCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Upcoming bookings</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{upcoming.length}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <BookingTabs bookings={tabBookings} />

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-zinc-900">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <Link
                href="/event-types"
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Manage event types
              </Link>
              <Link
                href="/availability"
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Update availability
              </Link>
              <Link
                href="/bookings"
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Open bookings dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-zinc-900">Recent event types</h2>
            <div className="mt-4 space-y-2">
              {eventTypes.length === 0 ? (
                <p className="text-sm text-zinc-500">No event types found.</p>
              ) : (
                eventTypes.map((et) => (
                  <div
                    key={et.id}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-zinc-900">{et.title}</p>
                    <p className="text-zinc-500">
                      {et.duration} min · /book/{et.slug}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Past bookings snapshot</h2>
        <p className="mt-1 text-sm text-zinc-500">
          You have {past.length} completed or older bookings.
        </p>
      </section>
    </div>
  );
}

