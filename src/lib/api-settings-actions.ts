"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const API_KEY_SETTING_NAME = "api_secret_key";
const DEFAULT_API_KEY = "media-secret-key-123";

export async function getApiKey() {
    try {
        let setting = await prisma.systemSettings.findUnique({
            where: { key: API_KEY_SETTING_NAME }
        });

        if (!setting) {
            // Create default if not exists
            setting = await prisma.systemSettings.create({
                data: {
                    key: API_KEY_SETTING_NAME,
                    value: DEFAULT_API_KEY
                }
            });
        }

        return { success: true, key: setting.value };
    } catch (error) {
        console.error("Error fetching API key:", error);
        return { success: false, error: "Failed to fetch API key" };
    }
}

export async function updateApiKey(newKey: string) {
    if (!newKey || newKey.length < 5) {
        return { success: false, error: "API Key must be at least 5 characters long" };
    }

    try {
        await prisma.systemSettings.upsert({
            where: { key: API_KEY_SETTING_NAME },
            update: { value: newKey },
            create: {
                key: API_KEY_SETTING_NAME,
                value: newKey
            }
        });

        revalidatePath("/admin/dashboard/developer-zone");
        return { success: true };
    } catch (error) {
        console.error("Error updating API key:", error);
        return { success: false, error: "Failed to update API key" };
    }
}
