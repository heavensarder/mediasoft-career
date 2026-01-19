"use server";

import { readFile } from "fs/promises";
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
