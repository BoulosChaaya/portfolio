"use server";

import { z } from "zod";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { adminAction, text, url, type ActionResult } from "./result";

const fields = z.object({
  bio: text(2000),
  available: z.enum(["true", "false"]),
  github: url,
  linkedin: url,
  email: z.union([z.literal(""), z.string().trim().email("must be an email address").max(320)]),
  stat_projects: text(20),
  stat_years: text(20),
  stat_saas: text(20),
  stat_location: text(20),
  currently_building: text(200),
  currently_building_detail: text(300),
  currently_learning: text(200),
  currently_open: text(200),
}).partial();
export type SettingsFields = z.input<typeof fields>;

/**
 * Saves the given settings in one statement, so a failure saves none of them rather than some.
 * Each form sends only its own keys; keys it does not send keep their values.
 */
export async function updateSettings(data: SettingsFields): Promise<ActionResult> {
  return adminAction(fields, data, async (values) => {
    const rows = Object.entries(values).filter(([, value]) => value !== undefined).map(([key, value]) => ({ key, value: value as string }));
    if (rows.length === 0) return;
    await db.insert(settings).values(rows).onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/skills");
    revalidatePath("/");
    revalidatePath("/about");
  });
}
