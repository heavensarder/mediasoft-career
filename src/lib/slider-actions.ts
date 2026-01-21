'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { deleteFile } from "./file-actions";

export type SliderImage = {
    id: number;
    url: string;
    createdAt: Date;
};

export async function getSliderImages(): Promise<SliderImage[]> {
    try {
        return await prisma.sliderImage.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching slider images:", error);
        return [];
    }
}

export async function addSliderImage(formData: FormData) {
    try {
        const file = formData.get('file') as File | null;
        const link = formData.get('link') as string | null;

        let url = '';

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
            const filename = `${uniqueSuffix}-${originalName}`;
            
            // Save to public/uploads
            const relativePath = `/uploads/${filename}`;
            const uploadPath = join(cwd(), "public", "uploads", filename);

            await writeFile(uploadPath, buffer);
            url = relativePath;
        } else if (link) {
            url = link;
        } else {
            return { success: false, error: "No image provided." };
        }

        await prisma.sliderImage.create({
            data: { url }
        });

        revalidatePath('/');
        revalidatePath('/admin/dashboard/white-label/image-slider');
        return { success: true };

    } catch (error) {
        console.error("Error adding slider image:", error);
        return { success: false, error: "Failed to add image." };
    }
}

export async function deleteSliderImage(id: number) {
    try {
        const image = await prisma.sliderImage.findUnique({
            where: { id }
        });

        if (image) {
            // Delete file if it's local
            if (image.url.startsWith('/uploads/')) {
                await deleteFile(image.url);
            }

            await prisma.sliderImage.delete({
                where: { id }
            });

            revalidatePath('/');
            revalidatePath('/admin/dashboard/white-label/image-slider');
            return { success: true };
        }
        return { success: false, error: "Image not found" };

    } catch (error) {
        console.error("Error deleting slider image:", error);
        return { success: false, error: "Failed to delete image." };
    }
}
