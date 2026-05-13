"use server";

import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(320),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
});

export async function submitContact(formData: FormData) {
  // Honeypot check — bots fill hidden fields
  const honeypot = formData.get("website") as string;
  if (honeypot) return { error: "Spam detected" };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) return { error: "Invalid form data" };

  const { name, email, subject, message } = parsed.data;

  await db.insert(contacts).values({ name, email, subject, message });

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "bouloschaaya92@gmail.com",
      subject: `New message from ${name}: ${subject || "No subject"}`,
      text: `From: ${name} (${email})\n\n${message}`,
    });
  } catch {
    // Email failed but we already saved to DB — not a fatal error
  }

  return { success: true };
}