import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Appointment submission — pluggable email delivery
// ---------------------------------------------------------------------------
// This server function validates an appointment request and dispatches two
// emails: one to the business inbox and a confirmation to the customer.
//
// Provider adapter is chosen at runtime by environment variables so you can
// switch to Resend, SMTP, or any other provider without touching UI code:
//
//   • Resend  → set  RESEND_API_KEY  (and optionally EMAIL_FROM)
//   • SMTP    → wire up sendViaSmtp() below with nodemailer or similar
//   • None    → submissions are still validated & logged; UI still succeeds
//                so the form can be tested before email is wired.
//
// Business inbox defaults to BeauvaisGroup@gmail.com (BUSINESS_EMAIL override).
// ---------------------------------------------------------------------------

const AppointmentSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(7, "Phone is required").max(30),
  service: z.string().trim().max(80).optional().default(""),
  date: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
});

export type AppointmentInput = z.infer<typeof AppointmentSchema>;

interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendViaResend(msg: EmailMessage, apiKey: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: msg.from,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      reply_to: msg.replyTo,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

// Placeholder — implement with nodemailer or another SMTP client when needed.
async function sendViaSmtp(_msg: EmailMessage): Promise<void> {
  throw new Error("SMTP transport not configured");
}

async function dispatchEmail(msg: EmailMessage): Promise<{ delivered: boolean; provider: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    await sendViaResend(msg, resendKey);
    return { delivered: true, provider: "resend" };
  }
  if (process.env.SMTP_HOST) {
    await sendViaSmtp(msg);
    return { delivered: true, provider: "smtp" };
  }
  // No provider wired yet — log & continue so the UX still works in preview.
  console.info("[appointments] email provider not configured; skipping send", {
    to: msg.to,
    subject: msg.subject,
  });
  return { delivered: false, provider: "none" };
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function businessEmailHtml(data: AppointmentInput) {
  const row = (label: string, val: string) =>
    val ? `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;">${label}</td><td style="padding:6px 12px;color:#1e293b;font-weight:600;">${escape(val)}</td></tr>` : "";
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#2199CE,#45C481);padding:20px 24px;color:#fff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85;">New Appointment Request</div>
          <div style="font-size:20px;font-weight:700;margin-top:4px;">Beauvais Group</div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          ${row("Name", data.name)}
          ${row("Email", data.email)}
          ${row("Phone", data.phone)}
          ${row("Service", data.service)}
          ${row("Preferred Date", data.date)}
        </table>
        ${data.message ? `<div style="padding:0 24px 20px;"><div style="font-size:13px;color:#64748b;margin-bottom:6px;">Message</div><div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px;color:#1e293b;white-space:pre-wrap;">${escape(data.message)}</div></div>` : ""}
      </div>
    </div>`;
}

function customerEmailHtml(data: AppointmentInput) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#F8FAFC;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#2199CE,#45C481);padding:24px;color:#fff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:.85;">Thank You, ${escape(data.name.split(" ")[0])}</div>
          <div style="font-size:22px;font-weight:700;margin-top:6px;">We received your appointment request</div>
        </div>
        <div style="padding:24px;color:#1e293b;line-height:1.6;">
          <p>Hi ${escape(data.name)},</p>
          <p>Thank you for reaching out to <strong>Beauvais Group &amp; Personal Care Home Inc.</strong> Our care team has received your request and will contact you within 24 hours to confirm the details.</p>
          ${data.service ? `<p><strong>Service:</strong> ${escape(data.service)}</p>` : ""}
          ${data.date ? `<p><strong>Preferred date:</strong> ${escape(data.date)}</p>` : ""}
          <p>If your need is urgent, please call us anytime at <a href="tel:+19548596294" style="color:#2199CE;text-decoration:none;font-weight:600;">(954) 859-6294</a>.</p>
          <p style="margin-top:24px;">With care,<br/><strong>The Beauvais Group Team</strong></p>
        </div>
        <div style="background:#F8FAFC;padding:16px 24px;border-top:1px solid #E2E8F0;color:#64748b;font-size:12px;text-align:center;">
          944 Crossing Rock Dr, Lawrenceville, GA 30045 · Open 24/7
        </div>
      </div>
    </div>`;
}

export const submitAppointment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AppointmentSchema.parse(data))
  .handler(async ({ data }) => {
    const businessEmail = process.env.BUSINESS_EMAIL || "BeauvaisGroup@gmail.com";
    const from = process.env.EMAIL_FROM || "Beauvais Group <onboarding@resend.dev>";

    const results = await Promise.allSettled([
      dispatchEmail({
        to: businessEmail,
        from,
        replyTo: data.email,
        subject: `New appointment request — ${data.name}`,
        html: businessEmailHtml(data),
      }),
      dispatchEmail({
        to: data.email,
        from,
        subject: "We received your appointment request — Beauvais Group",
        html: customerEmailHtml(data),
      }),
    ]);

    const errors = results
      .map((r, i) => (r.status === "rejected" ? `${i === 0 ? "business" : "customer"}: ${String(r.reason)}` : null))
      .filter(Boolean);

    if (errors.length) {
      console.error("[appointments] partial delivery failure", errors);
    }

    return { ok: true, delivered: errors.length === 0 };
  });
