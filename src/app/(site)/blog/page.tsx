import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function BlogPage() {
  const all = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return (
    <main>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-tight mb-3">
          Blog
        </h1>
        <p className="text-[15px] text-zinc-500 mb-12">
          Thoughts on building, engineering, and working from Beirut.
        </p>
        <div className="divide-y divide-black/8 dark:divide-white/8">
          {all.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="flex items-start justify-between gap-6 py-8 group"
            >
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-2">
                  {p.category || "Post"}
                </p>
                <h2 className="text-[19px] font-medium tracking-tight mb-2 group-hover:text-[#e84c1e] transition-colors">
                  {p.title}
                </h2>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{p.excerpt}</p>
              </div>
              <span
                className="text-xl mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#e84c1e" }}
              >
                →
              </span>
            </Link>
          ))}
          {all.length === 0 && (
            <p className="text-zinc-400 py-8">No posts published yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}