"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { adminAction, id, type ActionResult } from "./result";

export async function markRead(contactId: number): Promise<ActionResult> {
  return adminAction(id, contactId, async (id) => {
    await db.update(contacts).set({ read: true }).where(eq(contacts.id, id));
    revalidatePath("/admin/contacts");
  });
}

export async function deleteContact(contactId: number): Promise<ActionResult> {
  return adminAction(id, contactId, async (id) => {
    await db.delete(contacts).where(eq(contacts.id, id));
    revalidatePath("/admin/contacts");
  });
}
