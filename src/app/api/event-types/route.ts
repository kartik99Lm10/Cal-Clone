import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/server/defaultUser";
import { badRequest, json, serverError } from "@/server/http";
import { ensureNonEmptySlug } from "@/server/slug";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export async function GET() {
  const user = await getDefaultUser();
  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return json({ eventTypes });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          title?: string;
          description?: string;
          duration?: number;
          slug?: string;
        }
      | null;

    if (!body || !body.title || typeof body.title !== "string") {
      return badRequest("title is required");
    }
    const duration = Number(body.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      return badRequest("duration must be a positive number");
    }

    const user = await getDefaultUser();
    const base = ensureNonEmptySlug(body.slug ?? "", body.title);
    const slug = `${base}-${randomUUID().slice(0, 8)}`;

    const eventType = await prisma.eventType.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        duration,
        slug,
        userId: user.id,
      },
    });

    return json({ eventType }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return badRequest("slug must be unique");
    }
    return serverError();
  }
}

