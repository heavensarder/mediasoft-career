import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const department = await prisma.department.findFirst();
  const jobType = await prisma.jobType.findFirst();
  const location = await prisma.location.findFirst();

  if (!department || !jobType || !location) {
      console.error("Missing lookup data (Department/Type/Location). Run main seed first.");
      return;
  }

  const job = await prisma.job.create({
    data: {
      title: "Senior Software Engineer",
      description: "<p>We are looking for an experienced <strong>Software Engineer</strong> to join our team.</p><ul><li>React & Next.js</li><li>Node.js</li><li>SQL</li></ul>",
      departmentId: department.id,
      typeId: jobType.id,
      locationId: location.id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      status: "Active",
      salaryRange: "100k - 150k"
    },
  });

  console.log("Seeded Job:", job);
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
