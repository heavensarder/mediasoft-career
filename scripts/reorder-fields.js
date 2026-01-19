const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Reordering Form Fields...');

    // Set Photo to order 0
    const photo = await prisma.formField.findUnique({ where: { name: 'photo' } });
    if (photo) {
        await prisma.formField.update({
            where: { name: 'photo' },
            data: { order: 0 }
        });
        console.log('✅ Photo moved to top (order: 0)');
    } else {
        console.log('⚠️ Photo field not found');
    }

    // Update other system fields to be after photo if needed, 
    // but just moving Photo to 0 and keeping others as is (1, 2, 3...) should work fine as they are > 0.

    console.log('✅ Reorder complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
