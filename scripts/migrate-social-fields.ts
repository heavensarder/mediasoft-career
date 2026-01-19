
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Migrating social data...');

    const apps = await prisma.application.findMany();
    for (const app of apps) {
        let needsUpdate = false;
        const updates: any = {};
        const dynamicData = (app.dynamicData as any) || {};

        // 1. Migrate Facebook
        if (!app.facebook && dynamicData['facebook_profile']) {
            updates.facebook = dynamicData['facebook_profile'];
            needsUpdate = true;
            console.log(`Migrating Facebook for app ${app.id}`);
        }

        // 2. Migrate Portfolio/GitHub
        if (!app.portfolio && dynamicData['portfolio_github_profile']) {
            updates.portfolio = dynamicData['portfolio_github_profile'];
            needsUpdate = true;
            console.log(`Migrating Portfolio for app ${app.id}`);
        }

        if (needsUpdate) {
            await prisma.application.update({
                where: { id: app.id },
                data: updates
            });
        }
    }

    console.log('Deleting duplicate fields...');
    // Delete the old custom fields so only the system ones remain
    await prisma.formField.deleteMany({
        where: {
            name: { in: ['facebook_profile', 'portfolio_github_profile'] }
        }
    });

    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
