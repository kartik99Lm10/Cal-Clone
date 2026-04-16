import { prisma } from "@/lib/prisma";
import { badRequest, json, serverError } from "@/server/http";
import { Prisma } from "@prisma/client";
import {
  dateToDateOnlyUtc,
  dayOfWeekForDateInTimezone,
  generateSlotsForRange,
} from "@/server/scheduling";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: { eventType: true },
    orderBy: { createdAt: "desc" },
  });
  return json({ bookings });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          name?: string;
          email?: string;
          date?: string; // YYYY-MM-DD
          time?: string; // HH:mm
          eventTypeId?: string;
        }
      | null;

    if (!body) return badRequest("body is required");
    if (!body.name || typeof body.name !== "string") return badRequest("name is required");
    if (!body.email || typeof body.email !== "string") return badRequest("email is required");
    if (!body.date || typeof body.date !== "string") return badRequest("date is required (YYYY-MM-DD)");
    if (!body.time || typeof body.time !== "string") return badRequest("time is required (HH:mm)");
    if (!body.eventTypeId || typeof body.eventTypeId !== "string") {
      return badRequest("eventTypeId is required");
    }
    const dateString = body.date;

    const date = new Date(`${dateString}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return badRequest("date is invalid");
    const dateOnly = dateToDateOnlyUtc(date);

    const eventType = await prisma.eventType.findUnique({
      where: { id: body.eventTypeId },
      include: { user: { include: { availabilities: true } } },
    });
    if (!eventType) return badRequest("eventTypeId is invalid");

    const dayAvailabilities = eventType.user.availabilities.filter((a) => {
      const weekday = dayOfWeekForDateInTimezone(dateString, a.timezone);
      return weekday !== null && weekday === a.dayOfWeek;
    });
    const allowedSlots = new Set(
      dayAvailabilities.flatMap((a) =>
        generateSlotsForRange(a.startTime, a.endTime, eventType.duration),
      ),
    );
    if (!allowedSlots.has(body.time)) {
      return badRequest("Selected time is outside availability");
    }

    const existing = await prisma.booking.findFirst({
      where: { eventTypeId: body.eventTypeId, date: dateOnly, time: body.time },
      select: { id: true },
    });
    if (existing) return badRequest("This time slot is already booked");

    const booking = await prisma.booking.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        date: dateOnly,
        time: body.time,
        eventTypeId: body.eventTypeId,
      },
    });

    return json({ booking }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return badRequest("This time slot is already booked");
    }
    return serverError();
  }
}

