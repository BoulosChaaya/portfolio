"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

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
  await requireAuth();
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
  await requireAuth();
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function deleteProject(id: number) {
  await requireAuth();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function togglePublished(id: number, published: boolean) {
  await requireAuth();
  await db.update(projects).set({ published }).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}