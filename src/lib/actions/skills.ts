"use server";

import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function createSkill(data: { name: string; category: string; order: number }) {
  await requireAuth();
  await db.insert(skills).values(data);
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}

export async function deleteSkill(id: number) {
  await requireAuth();
  await db.delete(skills).where(eq(skills.id, id));
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}

export async function updateSkill(id: number, data: { name: string; category: string }) {
  await requireAuth();
  await db.update(skills).set(data).where(eq(skills.id, id));
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}