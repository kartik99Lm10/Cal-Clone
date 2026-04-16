import { prisma } from "@/lib/prisma";
import { badRequest, json, notFound, serverError } from "@/server/http";
import { isValidTimeRange } from "@/server/scheduling";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as
      | {
          dayOfWeek?: number;
          startTime?: string;
          endTime?: string;
          timezone?: string;
        }
      | null;

    if (!body) return badRequest("body is required");
    const dayOfWeek = Number(body.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return badRequest("dayOfWeek must be an integer 0-6");
    }
    if (!body.startTime || typeof body.startTime !== "string") {
      return badRequest("startTime is required");
    }
    if (!body.endTime || typeof body.endTime !== "string") {
      return badRequest("endTime is required");
    }
    if (!isValidTimeRange(body.startTime, body.endTime)) {
      return badRequest("endTime must be later than startTime");
    }
    if (!body.timezone || typeof body.timezone !== "string") {
      return badRequest("timezone is required");
    }

    const existing = await prisma.availability.findUnique({ where: { id } });
    if (!existing) return notFound("availability not found");

    const availability = await prisma.availability.update({
      where: { id },
      data: {
        dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone,
      },
    });
    return json({ availability });
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await prisma.availability.findUnique({ where: { id } });
    if (!existing) return notFound("availability not found");
    await prisma.availability.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return serverError();
  }
}

