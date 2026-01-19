
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding social fields...');

    const fields = [
        {
            label: 'Facebook Profile',
            name: 'facebook',
            type: 'text',
            required: false,
            placeholder: 'https://facebook.com/yourprofile',
            order: 10,
            isSystem: true,
            isActive: true,
        },
        {
            label: 'Portfolio / GitHub',
            name: 'portfolio',
            type: 'text',
            required: false,
            placeholder: 'https://github.com/yourusername',
            order: 11,
            isSystem: true,
            isActive: true,
        }
    ];

    for (const field of fields) {
        await prisma.formField.upsert({
            where: { name: field.name },
            update: field,
            create: field,
        });
        console.log(`Upserted ${field.label}`);
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
