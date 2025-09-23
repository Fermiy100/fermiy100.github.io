import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "P@ssw0rd1!";
  const hash = await bcrypt.hash(password, 10);

  const school = await prisma.school.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Demo School",
      address: "Demo address"
    }
  });

  const director = await prisma.user.upsert({
    where: { email: "director@school.test" },
    update: {},
    create: {
      email: "director@school.test",
      password: hash,
      role: "DIRECTOR",
      verified: true,
      schoolId: school.id
    }
  });

  const parent = await prisma.user.upsert({
    where: { email: "parent@school.test" },
    update: {},
    create: {
      email: "parent@school.test",
      password: hash,
      role: "PARENT",
      verified: true,
      schoolId: school.id
    }
  });

  console.log("Seed done");
}

main().catch(e=>{console.error(e); process.exit(1)}).finally(async ()=>{ await (new PrismaClient()).$disconnect(); });
