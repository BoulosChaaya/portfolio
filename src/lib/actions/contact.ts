"use server";

import { and, count, gt, sql } from "drizzle-orm";
import { Resend } from "resend";
import { z } from "zod";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(2000),
});

// The form is public: without limits, one script could fill the database and the mail quota.
// Counted from the stored messages, so the limit holds across Vercel's function instances.
const PER_SENDER_PER_HOUR = 3;
const ALL_PER_TEN_MINUTES = 20;

type Result = { success: true } | { success: false; error: string };

export async function submitContact(formData: FormData): Promise<Result> {
  // Honeypot: a hidden field only bots fill. Answer as if it worked, so bots learn nothing.
  if (formData.get("website")) return { success: true };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) return { success: false, error: "Please check the form: a name, a valid email and a message are needed." };
  const { name, email, subject, message } = parsed.data;

  const [[fromSender], [overall]] = await Promise.all([
    db.select({ n: count() }).from(contacts)
      .where(and(sql`lower(${contacts.email}) = ${email.toLowerCase()}`, gt(contacts.createdAt, sql`now() - interval '1 hour'`))),
    db.select({ n: count() }).from(contacts).where(gt(contacts.createdAt, sql`now() - interval '10 minutes'`)),
  ]);
  if ((fromSender?.n ?? 0) >= PER_SENDER_PER_HOUR) {
    return { success: false, error: "You have sent several messages in the last hour. I will reply to those first." };
  }
  if ((overall?.n ?? 0) >= ALL_PER_TEN_MINUTES) {
    return { success: false, error: "The contact form is busy right now. Please try again in a few minutes." };
  }

  await db.insert(contacts).values({ name, email, subject, message });

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "bouloschaaya92@gmail.com",
      subject: `New message from ${name}: ${subject || "No subject"}`,
      text: `From: ${name} (${email})\n\n${message}`,
    });
  } catch {
    // The message is saved and shows in the dashboard; the email is only a notification.
  }

  return { success: true };
}
