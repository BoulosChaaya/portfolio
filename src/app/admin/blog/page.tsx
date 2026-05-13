import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { BlogTable } from "@/components/dashboard/blog-table";

export default async function BlogPage() {
  const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Blog</h1>
      </div>
      <BlogTable posts={allPosts} />
    </div>
  );
}