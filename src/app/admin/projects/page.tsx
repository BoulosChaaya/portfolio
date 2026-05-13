import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { ProjectsTable } from "@/components/dashboard/projects-table";

export default async function ProjectsPage() {
  const allProjects = await db.select().from(projects).orderBy(projects.order);
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>
      <ProjectsTable projects={allProjects} />
    </div>
  );
}