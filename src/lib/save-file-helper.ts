import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

export async function saveFile(file: File, folder: string): Promise<string> {
    if (!file || file.size === 0) return '';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = originalName.split('.').pop() || 'bin';
    const filename = `${uniqueSuffix}.${extension}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', folder);
    try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(join(uploadDir, filename), buffer);
    } catch (e) {
        console.error("File save error:", e);
        throw new Error("Failed to save file");
    }

    return `/${folder}/${filename}`;
}
