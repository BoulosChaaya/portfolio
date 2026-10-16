"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { adminAction, id, required, type ActionResult } from "./result";

const CATEGORIES = ["Frontend", "Backend", "Database", "DevOps"] as const;
const fields = z.object({ name: required(60), category: z.enum(CATEGORIES) });

function refresh() {
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}

export async function createSkill(data: { name: string; category: string; order: number }): Promise<ActionResult> {
  return adminAction(fields.extend({ order: z.number().int().min(0) }), data, async (skill) => {
    await db.insert(skills).values(skill);
    refresh();
  });
}

export async function updateSkill(skillId: number, data: { name: string; category: string }): Promise<ActionResult> {
  return adminAction(z.object({ id, fields }), { id: skillId, fields: data }, async ({ id, fields: skill }) => {
    await db.update(skills).set(skill).where(eq(skills.id, id));
    refresh();
  });
}

export async function deleteSkill(skillId: number): Promise<ActionResult> {
  return adminAction(id, skillId, async (id) => {
    await db.delete(skills).where(eq(skills.id, id));
    refresh();
  });
}
