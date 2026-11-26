import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const provider = await prisma.provider.findUnique({
    where: { email: "randomemployee@example.com" }, // the email from your seed.ts
  });
  if (!provider) throw new Error("Seed the provider first");

  if ((await prisma.visitType.count()) === 0) {
    await prisma.visitType.createMany({
      data: [
        { name: "Follow-up", durationMinutes: 30 },
        { name: "New patient", durationMinutes: 60 },
        { name: "Annual physical", durationMinutes: 45 },
      ],
    });
  }

  if ((await prisma.availabilityRule.count({ where: { providerId: provider.id } })) === 0) {
    // Monday to Friday, 9:00 to 17:00 (540 to 1020 minutes after midnight)
    await prisma.availabilityRule.createMany({
      data: [1, 2, 3, 4, 5].map((weekday) => ({
        providerId: provider.id,
        weekday,
        startMinutes: 540,
        endMinutes: 1020,
      })),
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());