"use server";

import { db } from "@/lib/db";
import { experience } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function createExperience(data: {
  company: string;
  role: string;
  location: string;
  duration: string;
  description: string;
}) {
  await requireAuth();
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
  await requireAuth();
  await db.update(experience).set(data).where(eq(experience.id, id));
  revalidatePath("/admin/experience");
  revalidatePath("/about");
}

export async function deleteExperience(id: number) {
  await requireAuth();
  await db.delete(experience).where(eq(experience.id, id));
  revalidatePath("/admin/experience");
  revalidatePath("/about");
}