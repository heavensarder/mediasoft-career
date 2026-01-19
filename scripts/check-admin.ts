const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
    console.log('Checking Admin User...');
    const email = 'admin@mediasoftbd.com';

    const user = await prisma.admin.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('❌ User NOT found:', email);
        return;
    }

    console.log('✅ User found:', user.email);
    console.log('Stored Hash:', user.password);

    const testPassword = 'Mediasoft2026@#';
    const isMatch = await bcrypt.compare(testPassword, user.password);

    if (isMatch) {
        console.log('✅ Password verified successfully!');
    } else {
        console.error('❌ Password mismatch!');

        // Hash it again to see what it should be
        const newHash = await bcrypt.hash(testPassword, 12);
        console.log('Expected Hash (for new gen):', newHash);
    }
}

checkAdmin()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
