import { prisma } from "@/lib/prisma";
import { json, notFound, serverError } from "@/server/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        slug: true,
      },
    });
    if (!eventType) return notFound("event type not found");
    return json({ eventType });
  } catch {
    return serverError();
  }
}

