"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/dal";

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
}) {
  await assertAdmin();
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
  await assertAdmin();
  await db.update(posts).set({ ...data, updatedAt: new Date() }).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deletePost(id: number) {
  await assertAdmin();
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePostPublished(id: number, published: boolean) {
  await assertAdmin();
  await db.update(posts).set({ published }).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}