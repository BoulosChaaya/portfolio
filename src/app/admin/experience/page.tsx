import { db } from "@/lib/db";
import { experience } from "@/lib/db/schema";
import { ExperienceTable } from "@/components/dashboard/experience-table";

export default async function ExperiencePage() {
  const all = await db.select().from(experience).orderBy(experience.order);
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Experience</h1>
      <ExperienceTable items={all} />
    </div>
  );
}