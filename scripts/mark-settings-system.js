const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Marking existing settings as System Data...');

    // Update Departments
    const deptUpdate = await prisma.department.updateMany({
        data: { isSystem: true }
    });
    console.log(`✅ Marked ${deptUpdate.count} Departments as System.`);

    // Update JobTypes
    const typeUpdate = await prisma.jobType.updateMany({
        data: { isSystem: true }
    });
    console.log(`✅ Marked ${typeUpdate.count} Job Types as System.`);

    // Update Locations
    const locUpdate = await prisma.location.updateMany({
        data: { isSystem: true }
    });
    console.log(`✅ Marked ${locUpdate.count} Locations as System.`);

    console.log('✨ All existing settings are now System Data.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
