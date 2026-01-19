'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFormFields() {
    return await prisma.formField.findMany({
        orderBy: { order: 'asc' }
    });
}

export async function createFormField(data: {
    label: string,
    name: string,
    type: string,
    required: boolean,
    placeholder?: string,
    options?: string
}) {
    try {
        // Get max order to append to end
        const maxOrder = await prisma.formField.aggregate({
            _max: { order: true }
        });
        const order = (maxOrder._max.order || 0) + 1;

        await prisma.formField.create({
            data: {
                ...data,
                order,
                isSystem: false
            }
        });
        revalidatePath('/admin/dashboard/job-recruitment/settings');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to create field. Name might be duplicate.' };
    }
}

export async function updateFormField(id: number, data: {
    label: string,
    placeholder?: string,
    required: boolean,
    options?: string,
    isActive: boolean
}) {
    try {
        await prisma.formField.update({
            where: { id },
            data
        });
        revalidatePath('/admin/dashboard/job-recruitment/settings');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to update field.' };
    }
}

export async function deleteFormField(id: number) {
    try {
        // Only allow deleting non-system fields
        const field = await prisma.formField.findUnique({ where: { id } });
        if (field?.isSystem) {
            return { error: 'Cannot delete system fields.' };
        }

        await prisma.formField.delete({ where: { id } });
        revalidatePath('/admin/dashboard/job-recruitment/settings');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to delete field.' };
    }
}

export async function reorderFormFields(items: { id: number, order: number }[]) {
    try {
        // Transaction to update all orders
        await prisma.$transaction(
            items.map(item =>
                prisma.formField.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );
        revalidatePath('/admin/dashboard/job-recruitment/settings');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to reorder.' };
    }
}

// Seed function to be called if no fields exist
export async function seedSystemFields() {
    const count = await prisma.formField.count();
    if (count > 0) return;

    const systemFields = [
        { label: "Your Photo", name: "photo", type: "file", required: false, isSystem: true, order: 1 },
        { label: "Full Name", name: "fullName", type: "text", required: true, isSystem: true, order: 2 },
        { label: "NID", name: "nid", type: "text", required: true, placeholder: "10, 13 or 17 digit", isSystem: true, order: 3 },
        { label: "Date of Birth", name: "dob", type: "date", required: true, isSystem: true, order: 4 },
        { label: "Gender", name: "gender", type: "radio", required: true, options: "Male,Female,Other,Rather not Mention", isSystem: true, order: 5 },
        { label: "Mobile No", name: "mobile", type: "tel", required: true, isSystem: true, order: 6 },
        { label: "Email", name: "email", type: "email", required: true, isSystem: true, order: 7 },
        { label: "Experience", name: "experience", type: "select", required: true, options: "Less than 1 Year,1-3 Years,3-5 Years,5+ Years", isSystem: true, order: 8 },
        { label: "Current Salary", name: "currentSalary", type: "text", required: false, isSystem: true, order: 9 },
        { label: "Expected Salary", name: "expectedSalary", type: "text", required: false, isSystem: true, order: 10 },
        { label: "Latest Education", name: "education", type: "select", required: true, options: "PhD,Masters,Bachelor,Diploma,HSC,SSC", isSystem: true, order: 11 },
        { label: "Recruitment Source", name: "source", type: "select", required: true, options: "Linkedin,Bdjobs,Facebook,Website,Referral", isSystem: true, order: 12 },
        { label: "Career Objective", name: "objective", type: "textarea", required: true, isSystem: true, order: 13 },
        { label: "Upload CV/Resume", name: "resume", type: "file", required: true, isSystem: true, order: 14 },
        { label: "Achievements", name: "achievements", type: "textarea", required: false, isSystem: true, order: 15 },
        { label: "Your Message", name: "message", type: "textarea", required: false, isSystem: true, order: 16 },
        { label: "Linkedin Profile", name: "linkedin", type: "url", required: false, isSystem: true, order: 17 },
    ];

    for (const field of systemFields) {
        await prisma.formField.create({ data: field });
    }
}
