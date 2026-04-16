import { prisma } from "@/lib/prisma";
import { badRequest, json, notFound, serverError } from "@/server/http";
import { Prisma } from "@prisma/client";
import { ensureNonEmptySlug } from "@/server/slug";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as
      | {
          title?: string;
          description?: string;
          duration?: number;
          slug?: string;
        }
      | null;

    if (!body) return badRequest("body is required");
    if (body.title !== undefined && typeof body.title !== "string") {
      return badRequest("title must be a string");
    }
    if (body.description !== undefined && typeof body.description !== "string") {
      return badRequest("description must be a string");
    }
    if (body.slug !== undefined && typeof body.slug !== "string") {
      return badRequest("slug must be a string");
    }
    if (body.duration !== undefined) {
      const duration = Number(body.duration);
      if (!Number.isFinite(duration) || duration <= 0) {
        return badRequest("duration must be a positive number");
      }
    }

    const exists = await prisma.eventType.findUnique({ where: { id } });
    if (!exists) return notFound("event type not found");

    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        duration: body.duration === undefined ? undefined : Number(body.duration),
        slug:
          body.slug === undefined
            ? undefined
            : ensureNonEmptySlug(body.slug, exists.title),
      },
    });

    return json({ eventType: updated });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return badRequest("slug must be unique");
    }
    return serverError();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const exists = await prisma.eventType.findUnique({ where: { id } });
    if (!exists) return notFound("event type not found");
    await prisma.eventType.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return serverError();
  }
}

