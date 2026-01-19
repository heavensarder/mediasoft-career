
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function generateUniqueSlug(title: string, ignoreJobId?: number) {
    let slug = slugify(title, { lower: true, strict: true });
    let uniqueSlug = slug;
    let count = 1;

    while (true) {
        const existing = await prisma.job.findUnique({
            where: { slug: uniqueSlug } as any,
            select: { id: true }
        });

        if (!existing || (ignoreJobId && existing.id === ignoreJobId)) {
            return uniqueSlug;
        }

        uniqueSlug = `${slug}-${count}`;
        count++;
    }
}

async function main() {
    const jobs = await prisma.job.findMany();
    console.log(`Found ${jobs.length} jobs.`);

    for (const job of jobs) {
        console.log(`Job ID: ${job.id}, Current Slug: ${job.slug}, Title: ${job.title}`);
        const newSlug = await generateUniqueSlug(job.title, job.id);
        console.log(`  -> Proposed New Slug: ${newSlug}`);

        if (job.slug !== newSlug) {
            console.log(`  -> MISMATCH! Updating to '${newSlug}'`);
            await prisma.job.update({ where: { id: job.id }, data: { slug: newSlug } as any });
            console.log(`  -> FIXED!`);
        } else {
            console.log(`  -> Already clean.`);
        }
    }
}

main();
