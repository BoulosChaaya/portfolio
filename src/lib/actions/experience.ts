"use server";

import { db } from "@/lib/db";
import { experience } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/dal";

export async function createExperience(data: {
  company: string;
  role: string;
  location: string;
  duration: string;
  description: string;
}) {
  await assertAdmin();
  await db.insert(experience).values(data);
  revalidatePath("/admin/experience");
  revalidatePath("/about");
}

export async function updateExperience(id: number, data: {
  company: string;
  role: string;
  location: string;
  duration: string;
  description: string;
}) {
  await assertAdmin();
  await db.update(experience).set(data).where(eq(experience.id, id));
  revalidatePath("/admin/experience");
  revalidatePath("/about");
}

export async function deleteExperience(id: number) {
  await assertAdmin();
  await db.delete(experience).where(eq(experience.id, id));
  revalidatePath("/admin/experience");
  revalidatePath("/about");
}