import { db } from "@/lib/db";
import { experience, skills, settings } from "@/lib/db/schema";

export default async function AboutPage() {
  const [exp, allSkills, allSettings] = await Promise.all([
    db.select().from(experience).orderBy(experience.order),
    db.select().from(skills).orderBy(skills.category, skills.order),
    db.select().from(settings),
  ]);

  const s = Object.fromEntries(allSettings.map((x) => [x.key, x.value ?? ""]));

  const grouped = ["Frontend", "Backend", "Database", "DevOps"].reduce((acc, cat) => {
    acc[cat] = allSkills.filter((sk) => sk.category === cat);
    return acc;
  }, {} as Record<string, typeof allSkills>);

  const stats = [
    { num: s.stat_projects || "6+", label: "Projects shipped" },
    { num: s.stat_years || "4+", label: "Years building" },
    { num: s.stat_saas || "2", label: "SaaS products" },
    { num: s.stat_location || "LB", label: "Based in Beirut" },
  ];

  const currently = [
    { label: "Building", value: s.currently_building || "—" },
    { label: "Learning", value: s.currently_learning || "—" },
    { label: "Open to", value: s.currently_open || "—" },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 text-center">
          <p className="text-[12px] uppercase tracking-widest text-zinc-400 mb-4">About me</p>
          <h1
            className="font-medium tracking-tight leading-tight mb-6"
            style={{ fontSize: "clamp(36px, 6vw, 52px)" }}
          >
            Building products
            <br />
            <em style={{
              fontFamily: "Palatino Linotype, Palatino, Georgia, serif",
              fontStyle: "italic",
              color: "#e84c1e",
            }}>
              end to end.
            </em>
          </h1>
          <p className="text-[15px] text-zinc-500 leading-relaxed max-w-xl mx-auto">
            Full-stack developer based in Beirut, Lebanon. I build web applications
            from architecture and backend to UI and deployment. Focused on clean,
            functional products that solve real problems.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border border-black/8 dark:border-white/8 rounded-xl p-5 bg-white dark:bg-zinc-900 text-center"
              >
                <p className="text-[32px] font-medium tracking-tight mb-1" style={{ color: "#e84c1e" }}>
                  {stat.num}
                </p>
                <p className="text-[11px] text-zinc-400 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">
          <h2 className="text-[12px] uppercase tracking-widest text-zinc-400 mb-10 text-center">
            Experience
          </h2>
          <div className="space-y-0">
            {exp.map((e, i) => (
              <div key={e.id} className="relative pl-6 pb-10 last:pb-0 border-l border-black/8 dark:border-white/8">
                <div
                  className="absolute -left-1.25 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950"
                  style={{ background: i === 0 ? "#e84c1e" : "#d4d4d8" }}
                />
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-medium">{e.role}</h3>
                      {i === 0 && (
                        <span
                          className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "#fff3f0", color: "#e84c1e" }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-zinc-500 mb-2">
                      {e.company}{e.location && ` · ${e.location}`}
                    </p>
                    {e.description && (
                      <p className="text-[13px] text-zinc-400 leading-relaxed max-w-md">
                        {e.description}
                      </p>
                    )}
                  </div>
                  <p className="text-[12px] text-zinc-400 shrink-0">{e.duration}</p>
                </div>
              </div>
            ))}
            {exp.length === 0 && (
              <p className="text-zinc-400">No experience added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-b border-black/8 dark:border-white/8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">
          <h2 className="text-[12px] uppercase tracking-widest text-zinc-400 mb-8 text-center">
            Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(grouped).map(([cat, items]) => (
              items.length > 0 && (
                <div
                  key={cat}
                  className="border border-black/8 dark:border-white/8 rounded-xl p-5 bg-white dark:bg-zinc-900"
                >
                  <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-3">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[12px] text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Currently */}
      <section>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14">
          <h2 className="text-[12px] uppercase tracking-widest text-zinc-400 mb-8 text-center">
            Currently
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currently.map((item) => (
              <div
                key={item.label}
                className="border border-black/8 dark:border-white/8 rounded-xl p-5 bg-white dark:bg-zinc-900 text-center"
              >
                <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-2">{item.label}</p>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}