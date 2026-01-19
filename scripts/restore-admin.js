const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Restoring Admin...');
    const hashedPassword = await bcrypt.hash('Mediasoft2026@#', 10);

    const admin = await prisma.admin.upsert({
        where: { email: 'admin@mediasoftbd.com' },
        update: { password: hashedPassword },
        create: {
            name: 'Super Admin',
            email: 'admin@mediasoftbd.com',
            password: hashedPassword,
        },
    });
    console.log(`✅ Admin restored: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
