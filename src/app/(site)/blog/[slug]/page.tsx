import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });

  if (!post || !post.published) notFound();

  return (
    <main>
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-14">
        <Link
          href="/blog"
          className="text-[13px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-10 inline-block"
        >
          ← Back to blog
        </Link>
        <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-4 mt-6">
          {post.category || "Post"}
        </p>
        <h1 className="text-[32px] md:text-[42px] font-medium tracking-tight leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-[15px] text-zinc-500 mb-10 leading-relaxed pb-10 border-b border-black/8 dark:border-white/8">
          {post.excerpt}
        </p>
        <div className="space-y-5">
          {post.content?.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} className="text-[15px] leading-[1.85] text-zinc-700 dark:text-zinc-300">
              {line}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}