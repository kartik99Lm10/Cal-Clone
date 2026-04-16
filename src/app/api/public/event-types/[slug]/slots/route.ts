import { prisma } from "@/lib/prisma";
import {
  dateToDateOnlyUtc,
  dayOfWeekForDateInTimezone,
  generateSlotsForRange,
} from "@/server/scheduling";
import { badRequest, json, notFound, serverError } from "@/server/http";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const dateParam = new URL(req.url).searchParams.get("date");
    if (!dateParam) return badRequest("date query param is required (YYYY-MM-DD)");

    const date = new Date(`${dateParam}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return badRequest("date is invalid");
    const dateOnly = dateToDateOnlyUtc(date);

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: { user: { include: { availabilities: true } } },
    });
    if (!eventType) return notFound("event type not found");

    const dayAvailabilities = eventType.user.availabilities.filter((a) => {
      const weekday = dayOfWeekForDateInTimezone(dateParam, a.timezone);
      return weekday !== null && weekday === a.dayOfWeek;
    });

    const allSlots = Array.from(
      new Set(
        dayAvailabilities.flatMap((a) =>
          generateSlotsForRange(a.startTime, a.endTime, eventType.duration),
        ),
      ),
    ).sort();

    const bookings = await prisma.booking.findMany({
      where: {
        eventTypeId: eventType.id,
        date: dateOnly,
      },
      select: { time: true },
    });
    const booked = new Set(bookings.map((b) => b.time));
    const availableSlots = allSlots.filter((slot) => !booked.has(slot));

    return json({
      eventType: {
        id: eventType.id,
        title: eventType.title,
        duration: eventType.duration,
      },
      date: dateParam,
      slots: availableSlots,
    });
  } catch {
    return serverError();
  }
}

