import { Resend } from 'resend';
import nodemailer, { type Transporter } from 'nodemailer';

let resend: Resend | null = null;
let gmailTransport: Transporter | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function getGmailTransport() {
  // Free, no-domain sending via Gmail SMTP + App Password.
  // Set GMAIL_USER (full address) and GMAIL_APP_PASSWORD (16-char code).
  if (!gmailTransport && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    gmailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return gmailTransport;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // 1) Resend (primary)
  try {
    const client = getResendClient();
    if (client) {
      await client.emails.send({
        // Free tier: onboarding@resend.dev works without domain verification.
        // Set EMAIL_FROM after verifying your own domain in Resend.
        from: process.env.EMAIL_FROM || 'CalOpen <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
      return { success: true, via: 'resend' };
    }
  } catch (error) {
    console.error('Resend failed, trying Gmail fallback:', error);
  }

  // 2) Gmail SMTP fallback (free, no domain needed)
  try {
    const transport = getGmailTransport();
    if (transport) {
      await transport.sendMail({
        from: `"CalOpen" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      });
      return { success: true, via: 'gmail' };
    }
  } catch (error) {
    console.error('Gmail fallback failed:', error);
    return { success: false, error };
  }

  console.warn('No email provider configured, skipping email');
  return { success: true, skipped: true };
}

export function bookingConfirmationEmail(data: {
  bookerName: string;
  eventTitle: string;
  startTime: string;
  endTime: string;
  organizerName: string;
  meetingLink?: string;
  manageUrl?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Booking Confirmed</h1>
        </div>
        <div class="content">
          <p>Hi ${data.bookerName},</p>
          <p>Your booking has been confirmed with <strong>${data.organizerName}</strong>.</p>
          <div class="details">
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${data.startTime}</p>
            <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
            ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
          </div>
          ${data.manageUrl ? `<p><a class="button" href="${data.manageUrl}">Manage or cancel booking</a></p>` : ''}
          <p>If you need to reschedule or cancel, please contact us.</p>
        </div>
        <div class="footer">
          <p>Powered by CalOpen - Open Source Scheduling</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function bookingReminderEmail(data: {
  bookerName: string;
  eventTitle: string;
  startTime: string;
  organizerName: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Upcoming Appointment</h1>
        </div>
        <div class="content">
          <p>Hi ${data.bookerName},</p>
          <p>This is a reminder about your upcoming appointment with <strong>${data.organizerName}</strong>.</p>
          <div class="details">
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${data.startTime}</p>
          </div>
          <p>We look forward to seeing you!</p>
        </div>
        <div class="footer">
          <p>Powered by CalOpen - Open Source Scheduling</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
