"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { adminAction, id, required, slug, text, type ActionResult } from "./result";

const fields = z.object({
  title: required(200),
  slug,
  excerpt: text(300),
  content: text(50_000),
  category: text(60),
});
export type PostFields = z.input<typeof fields>;

function refresh(postSlug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  if (postSlug) revalidatePath(`/blog/${postSlug}`);
}

export async function createPost(data: PostFields): Promise<ActionResult> {
  return adminAction(fields, data, async (post) => {
    await db.insert(posts).values({ ...post, published: false });
    refresh(post.slug);
  });
}

export async function updatePost(postId: number, data: PostFields): Promise<ActionResult> {
  return adminAction(z.object({ id, fields }), { id: postId, fields: data }, async ({ id, fields: post }) => {
    await db.update(posts).set({ ...post, updatedAt: new Date() }).where(eq(posts.id, id));
    refresh(post.slug);
  });
}

export async function deletePost(postId: number): Promise<ActionResult> {
  return adminAction(id, postId, async (id) => {
    await db.delete(posts).where(eq(posts.id, id));
    refresh();
  });
}

export async function togglePostPublished(postId: number, published: boolean): Promise<ActionResult> {
  return adminAction(z.object({ id, published: z.boolean() }), { id: postId, published }, async ({ id, published }) => {
    const [post] = await db.update(posts).set({ published, updatedAt: new Date() }).where(eq(posts.id, id)).returning({ slug: posts.slug });
    refresh(post?.slug);
  });
}
