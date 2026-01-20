
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.application.count({
    where: { status: 'New' }
  });
  console.log('New Application Count:', count);
  
  const allApps = await prisma.application.findMany({
    select: { id: true, status: true, fullName: true }
  });
  console.log('All Applications:', allApps);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
