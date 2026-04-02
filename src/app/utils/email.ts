/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import status from "http-status";
import { envVars } from "../config/env";
import AppError from "../errorHelper/AppError";

function getTransporter() {
  const sender = envVars.EMAIL_SENDER;
  if (!sender) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Email is not configured. Set EMAIL_SENDER_SMTP_USER, EMAIL_SENDER_SMTP_PASS, EMAIL_SENDER_SMTP_HOST, EMAIL_SENDER_SMTP_PORT, EMAIL_SENDER_SMTP_FROM in .env.",
    );
  }
  if (!sender.SMTP_HOST || !sender.SMTP_USER || !sender.SMTP_PASS || !sender.SMTP_FROM) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Email is not configured. Missing one of EMAIL_SENDER_SMTP_HOST/USER/PASS/FROM.",
    );
  }
  const port = Number.parseInt(sender.SMTP_PORT, 10);
  return nodemailer.createTransport({
    host: sender.SMTP_HOST,
    port,
    // 465 = SSL; 587 = STARTTLS (Gmail etc.)
    secure: port === 465,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
    auth: {
      user: sender.SMTP_USER,
      pass: sender.SMTP_PASS,
    },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  /** File name under `src/app/template` without `.ejs` (e.g. `welcome`, `otp`). */
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  const sender = envVars.EMAIL_SENDER;
  if (!sender) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Email is not configured. Set EMAIL_SENDER_SMTP_* in .env.",
    );
  }

  try {
    const templatePath = path.resolve(
      process.cwd(),
      "src/app/template",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: sender.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    // eslint-disable-next-line no-console
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.log("Email Sending Error", message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
