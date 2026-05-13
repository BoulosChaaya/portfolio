"use server";

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function updateSettings(formData: FormData) {
  await requireAuth();
  const keys = [
    "bio", "available", "github", "linkedin", "email",
    "stat_projects", "stat_years", "stat_saas", "stat_location",
    "currently_building", "currently_learning", "currently_open",
  ];
  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value === null) continue;
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/admin/skills");
  revalidatePath("/");
  revalidatePath("/about");
}