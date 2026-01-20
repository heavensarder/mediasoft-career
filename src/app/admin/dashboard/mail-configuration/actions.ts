"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { google } from "googleapis";

export interface MailConfigData {
  id?: number;
  senderEmail: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  notificationSubject?: string | null;
  notificationBody?: string | null;
  isAutoReplyEnabled: boolean;
  autoReplyTemplateId?: number | null;
}

const REDIRECT_URI = "https://developers.google.com/oauthplayground";

// --- Template Actions ---

export async function getTemplates() {
  try {
    const templates = await prisma.mailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: templates };
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}

export async function createTemplate(data: { name: string; subject: string; body: string }) {
  try {
    // Check if name exists
    const existing = await prisma.mailTemplate.findUnique({
        where: { name: data.name }
    });
    
    if (existing) {
        return { success: false, error: 'A template with this name already exists' };
    }

    const template = await prisma.mailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
      },
    });
    revalidatePath('/admin/dashboard/mail-configuration');
    return { success: true, data: template, message: 'Template created successfully' };
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export async function updateTemplate(id: number, data: { name: string; subject: string; body: string }) {
  try {
    // Check name uniqueness if changed
    const existing = await prisma.mailTemplate.findFirst({
        where: { 
            name: data.name,
            id: { not: id }
        }
    });

    if (existing) {
        return { success: false, error: 'A template with this name already exists' };
    }

    await prisma.mailTemplate.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
      },
    });
    revalidatePath('/admin/dashboard/mail-configuration');
    return { success: true, message: 'Template updated successfully' };
  } catch (error) {
    console.error('Failed to update template:', error);
    return { success: false, error: 'Failed to update template' };
  }
}

export async function deleteTemplate(id: number) {
  try {
    // Check if used in config
    const config = await prisma.mailConfig.findFirst({
        where: { autoReplyTemplateId: id }
    });

    if (config) {
        return { success: false, error: 'Cannot delete this template because it is currently set as the Auto-Reply template.' };
    }

    await prisma.mailTemplate.delete({
      where: { id },
    });
    revalidatePath('/admin/dashboard/mail-configuration');
    return { success: true, message: 'Template deleted successfully' };
  } catch (error) {
    console.error('Failed to delete template:', error);
    return { success: false, error: 'Failed to delete template' };
  }
}

// --- Config Actions ---

export async function getMailConfig() {
  try {
    let config = await prisma.mailConfig.findFirst({
        include: { autoReplyTemplate: true }
    });

    if (!config) {
      config = await prisma.mailConfig.create({
        data: {
          senderEmail: "",
          clientId: "",
          clientSecret: "",
          refreshToken: "",
          notificationSubject: "",
          notificationBody: "",
          isAutoReplyEnabled: false,
          autoReplyTemplateId: null,
        },
        include: { autoReplyTemplate: true }
      });
    }

    return { success: true, data: config };
  } catch (error) {
    console.error("Failed to get mail config:", error);
    return { success: false, error: "Failed to fetch configuration" };
  }
}

export async function updateMailConfig(data: Partial<MailConfigData>) {
  try {
    const config = await prisma.mailConfig.findFirst();

    if (!config) {
      return { success: false, error: "Configuration not found" };
    }

    await prisma.mailConfig.update({
      where: { id: config.id },
      data: {
        senderEmail: data.senderEmail,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        refreshToken: data.refreshToken,
        notificationSubject: data.notificationSubject,
        notificationBody: data.notificationBody,
        isAutoReplyEnabled: data.isAutoReplyEnabled,
        autoReplyTemplateId: data.autoReplyTemplateId,
      },
    });

    revalidatePath("/admin/dashboard/mail-configuration");
    return { success: true, message: "Configuration saved successfully" };
  } catch (error) {
    console.error("Failed to update mail config:", error);
    return { success: false, error: "Failed to update configuration" };
  }
}

export async function resetMailConfig() {
  try {
    const config = await prisma.mailConfig.findFirst();

    if (!config) {
      return { success: false, error: "Configuration not found" };
    }

    await prisma.mailConfig.update({
      where: { id: config.id },
      data: {
        senderEmail: "",
        clientId: "",
        clientSecret: "",
        refreshToken: "",
        notificationSubject: "",
        notificationBody: "",
        isAutoReplyEnabled: false,
        autoReplyTemplateId: null,
      },
    });

    revalidatePath("/admin/dashboard/mail-configuration");
    return { success: true, message: "Configuration reset successfully" };
  } catch (error) {
    console.error("Failed to reset mail config:", error);
    return { success: false, error: "Failed to reset configuration" };
  }
}

export async function sendTestEmail(to: string) {
  try {
    const config = await prisma.mailConfig.findFirst();

    if (
      !config ||
      !config.clientId ||
      !config.clientSecret ||
      !config.refreshToken ||
      !config.senderEmail
    ) {
      return {
        success: false,
        error: "Missing configuration. Please save credentials first.",
      };
    }

    const { clientId, clientSecret, refreshToken, senderEmail } = config;

    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      REDIRECT_URI,
    );

    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: senderEmail,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken.token || "",
      },
    });

    await transport.sendMail({
      from: `MediaSoft <${senderEmail}>`,
      to: to,
      subject: "Test Email from MediaSoft Career Admin",
      text: "This is a test email to verify your mail configuration.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563EB;">Test Email</h2>
          <p>This is a test email to verify your mail configuration.</p>
          <p>If you received this, your Google Workspace OAuth2 setup is working correctly.</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">Sent from MediaSoft Career Admin Dashboard</p>
        </div>
      `,
    });

    return { success: true, message: "Test email sent successfully" };
  } catch (error: any) {
    console.error("Failed to send test email:", error);
    return {
      success: false,
      error: error.message || "Failed to send test email",
    };
  }
}

export async function sendEmailFromTemplate(to: string, subject: string, body: string) {
    try {
        const config = await prisma.mailConfig.findFirst();

        if (!config || !config.clientId || !config.clientSecret || !config.refreshToken || !config.senderEmail) {
            return { success: false, error: 'Missing configuration. Please save credentials in Mail Configuration.' };
        }

        const { clientId, clientSecret, refreshToken, senderEmail } = config;

        const oAuth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            REDIRECT_URI
        );

        oAuth2Client.setCredentials({ refresh_token: refreshToken });

        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: senderEmail,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken.token || '',
            },
        });

        await transport.sendMail({
            from: `MediaSoft <${senderEmail}>`,
            to: to,
            subject: subject,
            html: body,
        });

        return { success: true, message: 'Email sent successfully' };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        return { success: false, error: error.message || 'Failed to send email' };
    }
}
