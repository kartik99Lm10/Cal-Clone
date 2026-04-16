import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;
  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { eventType: true },
      })
    : null;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="p-6 md:p-8">
          <div className="text-sm font-medium text-zinc-500">
            Booking confirmed
          </div>
          {!booking ? (
            <div className="mt-3 text-sm text-zinc-500">
              Booking not found.
            </div>
          ) : (
            <>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                {booking.eventType.title}
              </h1>
              <div className="mt-4 space-y-2 text-sm text-zinc-700">
                <div>
                  Date: <span className="font-medium">{format(new Date(booking.date), "PPP")}</span>
                </div>
                <div>
                  Time: <span className="font-medium">{booking.time}</span>
                </div>
                <div>
                  Name: <span className="font-medium">{booking.name}</span>
                </div>
                <div>
                  Email: <span className="font-medium">{booking.email}</span>
                </div>
              </div>
              <div className="mt-6">
                <Link href={`/book/${booking.eventType.slug}`}>
                  <Button variant="secondary">Book another slot</Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

