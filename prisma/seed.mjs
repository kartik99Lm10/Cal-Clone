import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

function dateOnly(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "default@cal-clone.local" },
    update: {},
    create: { email: "default@cal-clone.local", name: "Default User" },
  });

  const eventTypesData = [
    {
      title: "30 Minute Intro Call",
      description: "Quick introduction call",
      duration: 30,
      slug: "intro-call",
    },
    {
      title: "60 Minute Deep Dive",
      description: "In-depth discussion",
      duration: 60,
      slug: "deep-dive",
    },
  ];

  const eventTypes = [];
  for (const eventType of eventTypesData) {
    const upserted = await prisma.eventType.upsert({
      where: { slug: eventType.slug },
      update: {
        title: eventType.title,
        description: eventType.description,
        duration: eventType.duration,
        userId: user.id,
      },
      create: {
        ...eventType,
        userId: user.id,
      },
    });
    eventTypes.push(upserted);
  }

  await prisma.availability.deleteMany({ where: { userId: user.id } });
  await prisma.availability.createMany({
    data: [
      { userId: user.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
      { userId: user.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata" },
      { userId: user.id, dayOfWeek: 3, startTime: "10:00", endTime: "16:00", timezone: "Asia/Kolkata" },
    ],
  });

  const existing = await prisma.booking.findMany({
    where: { eventTypeId: { in: eventTypes.map((e) => e.id) } },
    select: { eventTypeId: true, date: true, time: true },
  });
  const existingKey = new Set(
    existing.map((b) => `${b.eventTypeId}:${b.date.toISOString().slice(0, 10)}:${b.time}`),
  );

  const seedBookings = [
    { eventTypeId: eventTypes[0].id, name: "Alice", email: "alice@example.com", date: "2026-04-20", time: "10:00" },
    { eventTypeId: eventTypes[0].id, name: "Bob", email: "bob@example.com", date: "2026-04-21", time: "11:00" },
    { eventTypeId: eventTypes[1].id, name: "Charlie", email: "charlie@example.com", date: "2026-04-22", time: "14:00" },
  ];

  for (const booking of seedBookings) {
    const key = `${booking.eventTypeId}:${booking.date}:${booking.time}`;
    if (existingKey.has(key)) continue;
    await prisma.booking.create({
      data: {
        eventTypeId: booking.eventTypeId,
        name: booking.name,
        email: booking.email,
        date: dateOnly(booking.date),
        time: booking.time,
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

