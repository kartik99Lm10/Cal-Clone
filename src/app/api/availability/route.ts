import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/server/defaultUser";
import { badRequest, json, serverError } from "@/server/http";
import { isValidTimeRange } from "@/server/scheduling";

export async function GET() {
  const user = await getDefaultUser();
  const availability = await prisma.availability.findMany({
    where: { userId: user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return json({ availability });
}

export async function POST(req: Request) {
  try {
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
      return badRequest("dayOfWeek must be an integer 0-6 (0=Sun)");
    }
    if (!body.startTime || typeof body.startTime !== "string") {
      return badRequest("startTime is required (HH:mm)");
    }
    if (!body.endTime || typeof body.endTime !== "string") {
      return badRequest("endTime is required (HH:mm)");
    }
    if (!isValidTimeRange(body.startTime, body.endTime)) {
      return badRequest("endTime must be later than startTime");
    }
    if (!body.timezone || typeof body.timezone !== "string") {
      return badRequest("timezone is required");
    }

    const user = await getDefaultUser();
    const availability = await prisma.availability.create({
      data: {
        dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone,
        userId: user.id,
      },
    });

    return json({ availability }, { status: 201 });
  } catch {
    return serverError();
  }
}

