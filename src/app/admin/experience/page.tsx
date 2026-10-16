import { adminExperience } from "@/lib/admin-data";
import { ExperienceTable } from "@/components/dashboard/experience-table";

export default async function ExperiencePage() {
  const all = await adminExperience();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Experience</h1>
      <ExperienceTable items={all} />
    </div>
  );
}