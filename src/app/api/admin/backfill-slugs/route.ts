import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { NextResponse } from "next/server";

export async function GET() {
    const jobs = await prisma.job.findMany({
        where: { slug: null }, // or just findMany to update all
    });

    const updates = [];

    for (const job of jobs) {
        let slug = job.slug;
        if (!slug || slug === '' || slug.startsWith('cuid-Temp')) { // Assume we want to overwrite if not pretty
            const baseSlug = slugify(job.title, { lower: true, strict: true });
            slug = `${baseSlug}-${job.id}`; // Append ID to ensure uniqueness reliably for existing

            updates.push(prisma.job.update({
                where: { id: job.id },
                data: { slug }
            }));
        }
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ message: `Backfilled ${updates.length} slugs.` });
}
