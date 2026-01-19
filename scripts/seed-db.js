const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Seed Departments, JobTypes, Locations
    const deptMarketing = await prisma.department.upsert({
        where: { name: 'Marketing' },
        update: {},
        create: { name: 'Marketing' },
    });
    const deptEngineering = await prisma.department.upsert({
        where: { name: 'Engineering' },
        update: {},
        create: { name: 'Engineering' },
    });

    const typeFullTime = await prisma.jobType.upsert({
        where: { name: 'Full Time' },
        update: {},
        create: { name: 'Full Time' },
    });

    const locDhaka = await prisma.location.upsert({
        where: { name: 'Dhaka, Bangladesh' },
        update: {},
        create: { name: 'Dhaka, Bangladesh' },
    });

    // 2. Seed Jobs
    const job1 = await prisma.job.create({
        data: {
            title: 'Senior Software Engineer',
            description: '<p>We are looking for a Senior Software Engineer to join our team. You will be responsible for building scalable web applications.</p><ul><li>Experience with React and Node.js</li><li>Strong problem-solving skills</li></ul>',
            departmentId: deptEngineering.id,
            typeId: typeFullTime.id,
            locationId: locDhaka.id,
            expiryDate: new Date('2026-12-31'),
            status: 'Published',
            slug: 'senior-software-engineer',
            views: 120,
        },
    });

    const job2 = await prisma.job.create({
        data: {
            title: 'Product Marketing Manager',
            description: '<p>Lead our marketing initiatives and drive product growth.</p>',
            departmentId: deptMarketing.id,
            typeId: typeFullTime.id,
            locationId: locDhaka.id,
            expiryDate: new Date('2026-12-31'),
            status: 'Published',
            slug: 'product-marketing-manager',
            views: 85,
        },
    });

    // 3. Seed Form Fields (System Defaults)
    const systemFields = [
        { label: 'Photo', name: 'photo', type: 'file', required: true, isSystem: true, order: 0 },
        { label: 'Full Name', name: 'fullName', type: 'text', required: true, isSystem: true, order: 1 },
        { label: 'Email Address', name: 'email', type: 'email', required: true, isSystem: true, order: 2 },
        { label: 'Phone Number', name: 'mobile', type: 'tel', required: true, isSystem: true, order: 3 },
        { label: 'National ID (NID)', name: 'nid', type: 'text', required: true, isSystem: true, order: 4 },
        { label: 'Date of Birth', name: 'dob', type: 'date', required: true, isSystem: true, order: 5 },
        { label: 'Gender', name: 'gender', type: 'select', options: 'Male,Female,Other', required: true, isSystem: true, order: 6 },
        { label: 'Education Qualification', name: 'education', type: 'select', options: 'PhD,Masters,Bachelors,Diploma,HSC,SSC,O-Level,A-Level,Other', required: true, isSystem: true, order: 7 },
        { label: 'Years of Experience', name: 'experience', type: 'text', required: true, isSystem: true, order: 8 },
        { label: 'Recruitment Source', name: 'source', type: 'select', options: 'LinkedIn,Facebook,BdJobs,Referral,Other', required: true, isSystem: true, order: 9 },
        { label: 'Career Objective', name: 'objective', type: 'textarea', required: true, isSystem: true, order: 10 },
        { label: 'Current Salary', name: 'currentSalary', type: 'text', required: false, isSystem: true, order: 11 },
        { label: 'Expected Salary', name: 'expectedSalary', type: 'text', required: false, isSystem: true, order: 12 },
        { label: 'Achievements', name: 'achievements', type: 'textarea', required: false, isSystem: true, order: 13 },
        { label: 'Cover Letter / Message', name: 'message', type: 'textarea', required: false, isSystem: true, order: 14 },
        { label: 'LinkedIn Profile', name: 'linkedin', type: 'text', required: false, isSystem: true, order: 15 },
        { label: 'Facebook Profile', name: 'facebook', type: 'text', required: false, isSystem: true, order: 16 },
        { label: 'Portfolio URL', name: 'portfolio', type: 'text', required: false, isSystem: true, order: 17 },
        { label: 'Resume', name: 'resume', type: 'file', required: true, isSystem: true, order: 100 },
    ];

    for (const field of systemFields) {
        await prisma.formField.upsert({
            where: { name: field.name },
            update: {},
            create: field,
        });
    }

    console.log('✅ Seed completed!');
    console.log(`Created Job: ${job1.title} (/jobs/${job1.slug})`);
    console.log(`Created Job: ${job2.title} (/jobs/${job2.slug})`);
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
