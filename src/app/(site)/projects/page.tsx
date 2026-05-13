import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ProjectsPage() {
  const all = await db
    .select()
    .from(projects)
    .where(eq(projects.published, true));

  return (
    <main>
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-14">
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-tight mb-12">
          Work
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {all.map((p, i) => (
            <div
              key={p.id}
              className="border border-black/8 dark:border-white/8 rounded-xl p-6 bg-white dark:bg-zinc-900 group hover:border-[#e84c1e] transition-all hover:-translate-y-0.5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#e84c1e] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="flex justify-between items-start mb-4">
                <span
                  className="text-[24px] leading-none"
                  style={{
                    fontFamily: "Palatino Linotype, Georgia, serif",
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
              <h2 className="text-[18px] font-medium tracking-tight mb-2">{p.title}</h2>
              <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">{p.excerpt}</p>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {p.techStack?.split(",").map((t: string) => (
                  <span
                    key={t}
                    className="text-[10px] text-zinc-400 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800"
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                {p.liveUrl && (
                    <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium hover:underline"
                    style={{ color: "#e84c1e" }}
                  >
                    Live →
                  </a>
                )}
                {p.githubUrl && (
                    <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:underline"
                  >
                    GitHub →
                  </a>
                )}
            </div>
            </div>
          ))}
          {all.length === 0 && (
            <p className="text-zinc-400 col-span-2">No projects yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}