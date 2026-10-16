"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { adminAction, id, required, slug, text, url, type ActionResult } from "./result";

const fields = z.object({
  title: required(200),
  slug,
  excerpt: text(300),
  description: text(5000),
  techStack: text(300),
  liveUrl: url,
  githubUrl: url,
  category: text(60),
  featured: z.boolean(),
});
export type ProjectFields = z.input<typeof fields>;

function refresh() {
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function createProject(data: ProjectFields): Promise<ActionResult> {
  return adminAction(fields, data, async (project) => {
    await db.insert(projects).values({ ...project, published: true });
    refresh();
  });
}

/** Saves the fields only: publishing is its own action, so editing a draft keeps it a draft. */
export async function updateProject(projectId: number, data: ProjectFields): Promise<ActionResult> {
  return adminAction(z.object({ id, fields }), { id: projectId, fields: data }, async ({ id, fields: project }) => {
    await db.update(projects).set({ ...project, updatedAt: new Date() }).where(eq(projects.id, id));
    refresh();
  });
}

export async function deleteProject(projectId: number): Promise<ActionResult> {
  return adminAction(id, projectId, async (id) => {
    await db.delete(projects).where(eq(projects.id, id));
    refresh();
  });
}

export async function togglePublished(projectId: number, published: boolean): Promise<ActionResult> {
  return adminAction(z.object({ id, published: z.boolean() }), { id: projectId, published }, async ({ id, published }) => {
    await db.update(projects).set({ published, updatedAt: new Date() }).where(eq(projects.id, id));
    refresh();
  });
}
