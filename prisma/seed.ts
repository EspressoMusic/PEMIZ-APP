import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.platformConfig.upsert({
    where: { id: "default" },
    create: { id: "default", signupsEnabled: true },
    update: {},
  });

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@linky.local").toLowerCase();
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", emailVerified: true },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Platform Admin",
      role: "ADMIN",
      phone: "0500000000",
      emailVerified: true,
    },
  });

  console.log(`Admin ready: ${adminEmail} / Admin123!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
