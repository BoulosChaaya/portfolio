import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const all = await db.select().from(settings);
  const data = Object.fromEntries(all.map((s) => [s.key, s.value ?? ""]));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>
      <SettingsForm data={data} />
    </div>
  );
}