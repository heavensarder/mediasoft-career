
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const app = await prisma.application.findFirst({
        orderBy: { createdAt: 'desc' },
    });
    console.log('Latest Application:', app);

    const fields = await prisma.formField.findMany({
        where: { isActive: true },
    });
    console.log('Active Form Fields:', fields.map(f => ({ name: f.name, isSystem: f.isSystem })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
