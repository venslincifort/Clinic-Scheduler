import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

// this page seeds the database with initial data for the account login

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("password");

  const provider = await prisma.provider.create({
    data: {
      email: "randomemployee@example.com",
      firstName: "Maya",
      lastName: "Johnson",
      passwordHash: passwordHash,
      specialty: "Family medicine",
      timezone: "America/New_York"
    },
  });

  console.log("Provider created:", provider);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
