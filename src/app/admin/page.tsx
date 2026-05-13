import { db } from "@/lib/db";
import { projects, posts, contacts } from "@/lib/db/schema";
import Link from "next/link";
import { FolderKanban, FileText, Mail, ArrowRight } from "lucide-react";

export default async function AdminPage() {
  const [allProjects, allPosts, allContacts] = await Promise.all([
    db.select().from(projects),
    db.select().from(posts),
    db.select().from(contacts),
  ]);

  const unread = allContacts.filter((c) => !c.read).length;
  const published = allPosts.filter((p) => p.published).length;

  const stats = [
    {
      label: "Projects",
      value: allProjects.length,
      sub: `${allProjects.filter((p) => p.published).length} published`,
      href: "/admin/projects",
      icon: FolderKanban,
      accent: "#e84c1e",
    },
    {
      label: "Blog Posts",
      value: allPosts.length,
      sub: `${published} published`,
      href: "/admin/blog",
      icon: FileText,
      accent: "#3b82f6",
    },
    {
      label: "Messages",
      value: allContacts.length,
      sub: unread > 0 ? `${unread} unread` : "All read",
      href: "/admin/contacts",
      icon: Mail,
      accent: unread > 0 ? "#e84c1e" : "#22c55e",
    },
  ];

  const quickLinks = [
    { label: "Add project", href: "/admin/projects" },
    { label: "Write a post", href: "/admin/blog" },
    { label: "Update experience", href: "/admin/experience" },
    { label: "Edit settings", href: "/admin/settings" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group border border-black/8 dark:border-white/8 rounded-xl p-5 bg-white dark:bg-zinc-900 hover:border-[#e84c1e] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-4 w-4 text-zinc-400" />
              <ArrowRight className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-semibold tracking-tight mb-1">{stat.value}</p>
            <p className="text-[13px] text-zinc-500">{stat.label}</p>
            <p className="text-[11px] mt-1" style={{ color: stat.accent }}>{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="border border-black/8 dark:border-white/8 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
        <p className="text-[11px] uppercase tracking-widest text-zinc-400 px-5 py-3 border-b border-black/6 dark:border-white/6">
          Quick actions
        </p>
        {quickLinks.map((l, i) => (
          <Link
            key={l.label}
            href={l.href}
            className="flex items-center justify-between px-5 py-3.5 text-[13px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border-b border-black/5 dark:border-white/5 last:border-0"
          >
            {l.label}
            <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}