import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin
  const password = await hash("Mediasoft2026@#", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@mediasoftbd.com" },
    update: {},
    create: {
      email: "admin@mediasoftbd.com",
      name: "Super Admin",
      password,
    },
  });
  console.log({ admin });

  // Seed Departments
  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Design",
  ];
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept },
      update: {},
      create: { name: dept },
    });
  }

  // Seed Job Types
  const jobTypes = ["Full Time", "Part Time", "Work From Home", "Internship"];
  for (const type of jobTypes) {
    await prisma.jobType.upsert({
      where: { name: type },
      update: {},
      create: { name: type },
    });
  }

  // Seed Locations
  const locations = ["Dhaka, Bangladesh", "Remote", "Chittagong, Bangladesh"];
  for (const loc of locations) {
    await prisma.location.upsert({
      where: { name: loc },
      update: {},
      create: { name: loc },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
