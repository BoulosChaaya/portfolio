"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
}) {
  await requireAuth();
  await db.insert(posts).values({ ...data, published: false });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function updatePost(id: number, data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
}) {
  await requireAuth();
  await db.update(posts).set({ ...data, updatedAt: new Date() }).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deletePost(id: number) {
  await requireAuth();
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePostPublished(id: number, published: boolean) {
  await requireAuth();
  await db.update(posts).set({ published }).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}