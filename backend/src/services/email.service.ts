import nodemailer from "nodemailer";
import { env } from "../config/env";

/**
 * Nodemailer mail service wrapper.
 * Falls back to terminal logging if SMTP credentials are omitted.
 */
export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter() {
    if (this.transporter) return this.transporter;

    if (env.SMTP_HOST && env.SMTP_PORT) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // True for 465, false for other ports
        auth: env.SMTP_USER && env.SMTP_PASS ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        } : undefined,
      });
      return this.transporter;
    }
    return null;
  }

  /**
   * Sends an email to the specified recipient.
   */
  public static async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    const transporter = this.getTransporter();
    const from = env.SMTP_FROM || "noreply@krishimitra.org";

    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
        });
        console.log(`✉️ Email sent successfully to ${to}: "${subject}"`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
      }
    } else {
      console.log("-----------------------------------------");
      console.log(`✉️ [SMTP Mock Email Log]`);
      console.log(`To:      ${to}`);
      console.log(`From:    ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:    ${text}`);
      console.log("-----------------------------------------");
    }
  }
}
