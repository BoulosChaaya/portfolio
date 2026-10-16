import { adminProjects } from "@/lib/admin-data";
import { ProjectsTable } from "@/components/dashboard/projects-table";

export default async function ProjectsPage() {
  const allProjects = await adminProjects();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>
      <ProjectsTable projects={allProjects} />
    </div>
  );
}