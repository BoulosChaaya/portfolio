"use server";

import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/dal";

export async function createSkill(data: { name: string; category: string; order: number }) {
  await assertAdmin();
  await db.insert(skills).values(data);
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}

export async function deleteSkill(id: number) {
  await assertAdmin();
  await db.delete(skills).where(eq(skills.id, id));
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}

export async function updateSkill(id: number, data: { name: string; category: string }) {
  await assertAdmin();
  await db.update(skills).set(data).where(eq(skills.id, id));
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}