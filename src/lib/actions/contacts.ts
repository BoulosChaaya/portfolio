"use server";

import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/dal";

export async function markRead(id: number) {
  await assertAdmin();
  await db.update(contacts).set({ read: true }).where(eq(contacts.id, id));
  revalidatePath("/admin/contacts");
}

export async function deleteContact(id: number) {
  await assertAdmin();
  await db.delete(contacts).where(eq(contacts.id, id));
  revalidatePath("/admin/contacts");
}