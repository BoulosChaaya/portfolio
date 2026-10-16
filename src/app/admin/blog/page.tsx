import { adminPosts } from "@/lib/admin-data";
import { BlogTable } from "@/components/dashboard/blog-table";

export default async function BlogPage() {
  const allPosts = await adminPosts();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Blog</h1>
      </div>
      <BlogTable posts={allPosts} />
    </div>
  );
}