"use server";

import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

export async function getResumeBase64(fileUrl: string): Promise<string | null> {
  try {
    // Basic security check: ensure we only read from public/uploads
    if (!fileUrl.startsWith("/uploads/") && !fileUrl.startsWith("uploads/")) {
      console.error("Invalid file path security warning:", fileUrl);
      return null;
    }

    // Clean up path
    const cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    
    // Construct absolute path
    const absolutePath = join(cwd(), "public", cleanPath);

    // Read file
    const fileBuffer = await readFile(absolutePath);
    
    // Convert to base64
    const base64 = fileBuffer.toString("base64");
    
    // Return data URI
    return `data:application/pdf;base64,${base64}`;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

export async function deleteFile(existingPath: string | null): Promise<void> {
  if (!existingPath) return;

  try {
    // 1. Sanitize Path to prevent traversal attacks
    if (existingPath.includes('..')) {
      console.warn(`[Security] Attempted directory traversal in deleteFile: ${existingPath}`);
      return;
    }

    // 2. Ensure we only delete from alloweddirectories (e.g. public/uploads or public/branding)
    // Adjust logic if you store files elsewhere.
    const allowedPrefixes = ['/uploads/', '/branding/'];
    const isAllowed = allowedPrefixes.some(prefix => existingPath.startsWith(prefix));

    if (!isAllowed) {
         // It might be an external URL or system file we shouldn't touch
         return; 
    }

    // 3. Construct absolute path
    // Remove leading slash for join
    const relativePath = existingPath.startsWith('/') ? existingPath.slice(1) : existingPath;
    const absolutePath = join(cwd(), 'public', relativePath);

    // 4. Delete file
    await unlink(absolutePath);
    
  } catch (error: any) {
    // Ignore ENOENT (file not found), log others
    if (error.code !== 'ENOENT') {
      console.error(`[File Delete Error] Failed to delete ${existingPath}:`, error);
    }
  }
}
