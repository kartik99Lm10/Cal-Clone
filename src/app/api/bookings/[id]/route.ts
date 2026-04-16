import { prisma } from "@/lib/prisma";
import { json, notFound, serverError } from "@/server/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { eventType: true },
    });
    if (!booking) return notFound("booking not found");
    return json({ booking });
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
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return notFound("booking not found");
    await prisma.booking.delete({ where: { id } });
    return json({ ok: true });
  } catch {
    return serverError();
  }
}

