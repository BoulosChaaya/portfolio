"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/dal";

export async function createProject(data: {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  techStack: string;
  liveUrl: string;
  githubUrl: string;
  category: string;
  featured: boolean;
}) {
  await assertAdmin();
  await db.insert(projects).values({ ...data, published: true });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function updateProject(id: number, data: {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  techStack: string;
  liveUrl: string;
  githubUrl: string;
  category: string;
  featured: boolean;
  published: boolean;
}) {
  await assertAdmin();
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function deleteProject(id: number) {
  await assertAdmin();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function togglePublished(id: number, published: boolean) {
  await assertAdmin();
  await db.update(projects).set({ published }).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}