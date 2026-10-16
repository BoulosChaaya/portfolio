import { adminSkills } from "@/lib/admin-data";
import { SkillsManager } from "@/components/dashboard/skills-manager";

export default async function SkillsPage() {
  const { skills: allSkills, settings: allSettings } = await adminSkills();
  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value ?? ""]));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Skills & About</h1>
      <SkillsManager skills={allSkills} settings={settingsMap} />
    </div>
  );
}