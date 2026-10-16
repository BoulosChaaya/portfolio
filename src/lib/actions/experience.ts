"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { experience } from "@/lib/db/schema";
import { adminAction, id, required, text, type ActionResult } from "./result";

const fields = z.object({
  company: required(120),
  role: required(120),
  location: text(120),
  duration: text(60),
  description: text(2000),
});
export type ExperienceFields = z.input<typeof fields>;

function refresh() {
  revalidatePath("/admin/experience");
  revalidatePath("/about");
}

export async function createExperience(data: ExperienceFields): Promise<ActionResult> {
  return adminAction(fields, data, async (item) => {
    await db.insert(experience).values(item);
    refresh();
  });
}

export async function updateExperience(itemId: number, data: ExperienceFields): Promise<ActionResult> {
  return adminAction(z.object({ id, fields }), { id: itemId, fields: data }, async ({ id, fields: item }) => {
    await db.update(experience).set(item).where(eq(experience.id, id));
    refresh();
  });
}

export async function deleteExperience(itemId: number): Promise<ActionResult> {
  return adminAction(id, itemId, async (id) => {
    await db.delete(experience).where(eq(experience.id, id));
    refresh();
  });
}
