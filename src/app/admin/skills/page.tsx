import { db } from "@/lib/db";
import { skills, settings } from "@/lib/db/schema";
import { SkillsManager } from "@/components/dashboard/skills-manager";

export default async function SkillsPage() {
  const allSkills = await db.select().from(skills).orderBy(skills.category, skills.order);
  const allSettings = await db.select().from(settings);
  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value ?? ""]));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Skills & About</h1>
      <SkillsManager skills={allSkills} settings={settingsMap} />
    </div>
  );
}