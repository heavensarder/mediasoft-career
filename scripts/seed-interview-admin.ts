import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedInterviewAdmin() {
    const email = 'interviewadmin@mediasoftbd.com';
    const password = 'Mediasoft2026@#';
    const name = 'Mridul Shuttrodhor';

    // Check if already exists
    const existing = await prisma.interviewAdmin.findUnique({
        where: { email }
    });

    if (existing) {
        console.log('Interview Admin already exists:', email);
        return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Interview Admin
    const admin = await prisma.interviewAdmin.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'interview_admin',
        }
    });

    // Create default marking permissions (all enabled for first user)
    await prisma.markingPermission.create({
        data: {
            interviewAdminId: admin.id,
            writtenExam: true,
            technicalViva: true,
            project: true,
        }
    });

    console.log('✅ Interview Admin created successfully!');
    console.log('   Name:', name);
    console.log('   Email:', email);
    console.log('   Password:', password);
}

seedInterviewAdmin()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error seeding Interview Admin:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
