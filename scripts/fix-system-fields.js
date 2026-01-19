const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing System Fields...');

    // List of all fields that map to columns in the Application table
    const systemFields = [
        'fullName', 'nid', 'dob', 'gender', 'mobile', 'email',
        'experience', 'education', 'source', 'objective',
        'currentSalary', 'expectedSalary', 'achievements',
        'message', 'linkedin', 'facebook', 'portfolio',
        'resume', 'photo'
    ];

    for (const name of systemFields) {
        const result = await prisma.formField.updateMany({
            where: { name: name },
            data: { isSystem: true }
        });
        if (result.count > 0) {
            console.log(`✅ Marked '${name}' as System Field.`);
        } else {
            console.log(`⚠️ Field '${name}' not found.`);
        }
    }

    console.log('✨ System fields update complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
