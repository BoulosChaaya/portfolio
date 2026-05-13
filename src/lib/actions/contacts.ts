"use server";

import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function markRead(id: number) {
  await requireAuth();
  await db.update(contacts).set({ read: true }).where(eq(contacts.id, id));
  revalidatePath("/admin/contacts");
}

export async function deleteContact(id: number) {
  await requireAuth();
  await db.delete(contacts).where(eq(contacts.id, id));
  revalidatePath("/admin/contacts");
}