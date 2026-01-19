const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating Education Field...');

    await prisma.formField.upsert({
        where: { name: 'education' },
        update: {
            type: 'select',
            options: 'PhD,Masters,Bachelors,Diploma,HSC,SSC,O-Level,A-Level,Other'
        },
        create: {
            label: 'Education Qualification',
            name: 'education',
            type: 'select',
            options: 'PhD,Masters,Bachelors,Diploma,HSC,SSC,O-Level,A-Level,Other',
            required: true,
            isSystem: true,
            order: 7
        },
    });

    console.log('✅ Education field updated to dropdown!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
