
import "server-only";
import nodemailer from "nodemailer";
import { NotificationPayload, ChannelResult } from "../types";

export const runtime = "nodejs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailNotification(payload: NotificationPayload): Promise<ChannelResult> {
  const { email } = payload;
  
  if (!email || !email.to) {
    return { success: false, error: "Missing email destination" };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"German Virtual School" <no-reply@gvs.edu.de>',
      to: email.to,
      subject: email.subject || payload.title,
      text: email.text || payload.message,
      html: email.html, 
      attachments: email.attachments,
    });

    console.log(`[Email] Sent to ${email.to}`);
    return { success: true };
  } catch (error: any) {
    console.error("[Email] Failed:", error);
    return { success: false, error: error.message };
  }
}
