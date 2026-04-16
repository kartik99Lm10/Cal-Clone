import { prisma } from "@/lib/prisma";

const DEFAULT_USER_EMAIL = "default@cal-clone.local";

export async function getDefaultUser() {
  return prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Default User" },
  });
}

