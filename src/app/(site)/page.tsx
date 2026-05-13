import { db } from "@/lib/db";
import { projects, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function HomePage() {
  const featured = await db
    .select()
    .from(projects)
    .where(eq(projects.published, true))
    .orderBy(desc(projects.featured), projects.order)
    .limit(3);

  const latestPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt))
    .limit(2);

  const skills = [
    { label: "Frontend", value: "React · Next.js · TypeScript" },
    { label: "Backend", value: "Hono · tRPC · Node.js" },
    { label: "Database", value: "PostgreSQL · Drizzle · Prisma" },
    { label: "Deploy", value: "Vercel · Railway · Docker" },
    { label: "Learning", value: "AWS" },
  ];

  return (
    <main>
      {/* Hero — centered */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-14 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest text-white mb-8"
            style={{ background: "#e84c1e" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Available for remote work
          </div>

          <h1
            className="font-medium leading-[0.95] tracking-[-0.04em] mb-8"
            style={{ fontSize: "clamp(42px, 8vw, 80px)" }}
          >
            Full-Stack
            <br />
            Developer
            <br />
            <em
              style={{
                fontFamily: "Palatino Linotype, Palatino, Book Antiqua, Georgia, serif",
                fontStyle: "italic",
                color: "#e84c1e",
                fontSize: "clamp(48px, 9vw, 90px)",
              }}
            >
              &amp; Builder
            </em>
          </h1>

          <p className="text-[15px] md:text-[16px] leading-[1.8] text-zinc-500 max-w-xl mx-auto mb-10">
            Based in Beirut, Lebanon. I build web applications end to end — from
            architecture and backend to UI and deployment. Currently shipping SaaS
            products and taking on remote work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/projects"
              className="w-full sm:w-auto text-center py-3 px-8 text-[13px] font-medium text-white rounded-lg transition-opacity hover:opacity-80"
              style={{ background: "#e84c1e" }}
            >
              See my work ↓
            </Link>
            <Link
              href="/Resume.pdf"
              className="w-full sm:w-auto text-center py-3 px-8 text-[13px] border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Download CV
            </Link>
          </div>
        </div>
      </section>

      {/* Skills marquee */}
      <section className="border-b border-black/8 dark:border-white/8 overflow-hidden">
        <div className="flex animate-marquee w-max py-0">
          {[...skills, ...skills].map((s, i) => (
            <div
              key={i}
              className="px-8 py-3.5 text-[12px] border-r border-black/8 dark:border-white/8 whitespace-nowrap"
            >
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{s.label}</span>{" "}
              <span className="text-zinc-500">{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
          <div className="flex items-baseline justify-between mb-8">
            <span className="text-[13px] uppercase tracking-widest text-zinc-400">
              Selected Projects
            </span>
            <Link
              href="/projects"
              className="text-[13px] transition-colors"
              style={{ color: "#e84c1e" }}
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {featured.slice(0, 2).map((p, i) => (
              <div
                key={p.id}
                className="border border-black/8 dark:border-white/8 rounded-xl p-6 bg-white dark:bg-zinc-900 group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[#e84c1e] cursor-pointer"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#e84c1e] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <div className="flex justify-between items-start mb-4">
                  <span
                    className="text-[26px] leading-none"
                    style={{
                      fontFamily: "Palatino Linotype, Palatino, Georgia, serif",
                      fontStyle: "italic",
                      color: "#e84c1e",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 border border-black/8 dark:border-white/8 px-2.5 py-1 rounded-full">
                    {p.category || "Project"}
                  </span>
                </div>
                <h3 className="text-[18px] font-medium tracking-tight mb-2">{p.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-[1.65] mb-4">{p.excerpt}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {p.techStack?.split(",").map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] text-zinc-400 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800"
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {featured[2] && (
            <div className="border border-black/8 dark:border-white/8 rounded-xl p-6 bg-white dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-4 hover:border-[#e84c1e] transition-colors cursor-pointer">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-1">Project</p>
                <p className="text-[15px] font-medium">{featured[2].title}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-1">Type</p>
                <p className="text-[15px] font-medium">{featured[2].category || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-1">Stack</p>
                <p className="text-[15px] font-medium">
                  {featured[2].techStack?.split(",").slice(0, 3).join(" · ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Currently Building */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
          <p className="text-[13px] uppercase tracking-widest text-zinc-400 mb-8">
            Currently Building
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "HR & Payroll SaaS",
                desc: "Multi-tenant HR platform for SMBs — payroll, time tracking, PTO, and employee portal.",
              },
              {
                name: "Invoice SaaS",
                desc: "Multi-workspace invoicing with Stripe payments, PDF generation, and client portal.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="border border-black/8 dark:border-white/8 rounded-xl p-6 bg-white dark:bg-zinc-900 flex items-start justify-between gap-4"
              >
                <div>
                  <h3 className="text-[15px] font-medium mb-1.5">{item.name}</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
                <span
                  className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 font-medium"
                  style={{ background: "#fff3f0", color: "#e84c1e" }}
                >
                  Building
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      {latestPosts.length > 0 && (
        <section>
          <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
            <div className="flex items-baseline justify-between mb-8">
              <p className="text-[13px] uppercase tracking-widest text-zinc-400">
                From the Blog
              </p>
              <Link
                href="/blog"
                className="text-[13px] transition-colors"
                style={{ color: "#e84c1e" }}
              >
                All posts →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="border border-black/8 dark:border-white/8 rounded-xl p-6 bg-white dark:bg-zinc-900 hover:border-[#e84c1e] transition-colors group block"
                >
                  <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-2">
                    {p.category || "Post"}
                  </p>
                  <h3 className="text-[16px] font-medium tracking-tight mb-2 group-hover:text-[#e84c1e] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}