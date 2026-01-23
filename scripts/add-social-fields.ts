import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSocialFields() {
    try {
        // Check if facebook field already exists as system field
        const existingFacebook = await prisma.formField.findFirst({
            where: { name: 'facebook', isSystem: true }
        });

        if (!existingFacebook) {
            // Get max order
            const maxOrder = await prisma.formField.aggregate({
                _max: { order: true }
            });
            const nextOrder = (maxOrder._max.order || 0) + 1;

            await prisma.formField.create({
                data: {
                    label: "Facebook Profile",
                    name: "facebook",
                    type: "url",
                    required: false,
                    isSystem: true,
                    order: nextOrder
                }
            });
            console.log('✅ Added Facebook Profile system field');
        } else {
            console.log('ℹ️ Facebook Profile field already exists');
        }

        // Check if portfolio field already exists as system field
        const existingPortfolio = await prisma.formField.findFirst({
            where: { name: 'portfolio', isSystem: true }
        });

        if (!existingPortfolio) {
            const maxOrder = await prisma.formField.aggregate({
                _max: { order: true }
            });
            const nextOrder = (maxOrder._max.order || 0) + 1;

            await prisma.formField.create({
                data: {
                    label: "Website/GitHub",
                    name: "portfolio",
                    type: "url",
                    required: false,
                    isSystem: true,
                    order: nextOrder
                }
            });
            console.log('✅ Added Website/GitHub system field');
        } else {
            console.log('ℹ️ Website/GitHub field already exists');
        }

        // Also delete any custom (non-system) fields with same names to avoid duplication
        await prisma.formField.deleteMany({
            where: {
                OR: [
                    { name: 'facebook', isSystem: false },
                    { name: 'portfolio', isSystem: false }
                ]
            }
        });
        console.log('✅ Cleaned up any custom duplicate fields');

        console.log('\n🎉 Social fields update complete!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addSocialFields();
