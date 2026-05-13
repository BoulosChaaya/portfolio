"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createSkill, deleteSkill, updateSkill } from "@/lib/actions/skills";
import { updateSettings } from "@/lib/actions/settings";

type Skill = { id: number; name: string; category: string; order: number | null };

const CATEGORIES = ["Frontend", "Backend", "Database", "DevOps"];

export function SkillsManager({
  skills,
  settings,
}: {
  skills: Skill[];
  settings: Record<string, string>;
}) {
  const [newSkill, setNewSkill] = useState({ name: "", category: "Frontend" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "" });
  const [statStatus, setStatStatus] = useState<"idle" | "saving" | "saved">("idle");

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {} as Record<string, Skill[]>);

  async function handleAdd() {
    if (!newSkill.name.trim()) return;
    await createSkill({ ...newSkill, order: skills.length });
    setNewSkill({ name: "", category: "Frontend" });
  }

  async function handleSaveStats(formData: FormData) {
    setStatStatus("saving");
    await updateSettings(formData);
    setStatStatus("saved");
    setTimeout(() => setStatStatus("idle"), 2500);
  }

  return (
    <div className="space-y-10 max-w-2xl">

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold mb-4">About Page Stats</h2>
        <form action={handleSaveStats} className="grid grid-cols-2 gap-4">
          {[
            { key: "stat_projects", label: "Projects stat" },
            { key: "stat_years", label: "Years stat" },
            { key: "stat_saas", label: "SaaS stat" },
            { key: "stat_location", label: "Location stat" },
          ].map((s) => (
            <div key={s.key} className="flex flex-col gap-1.5">
              <Label>{s.label}</Label>
              <Input name={s.key} defaultValue={settings[s.key]} />
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-4">
            <Button type="submit" disabled={statStatus === "saving"}>
              {statStatus === "saving" ? "Saving..." : "Save Stats"}
            </Button>
            {statStatus === "saved" && (
              <span className="text-sm text-green-600">✓ Saved</span>
            )}
          </div>
        </form>
      </div>

      {/* Currently */}
      <div>
        <h2 className="text-base font-semibold mb-4">Currently Section</h2>
        <form action={handleSaveStats} className="space-y-4">
          {[
            { key: "currently_building", label: "Building" },
            { key: "currently_learning", label: "Learning" },
            { key: "currently_open", label: "Open to" },
          ].map((s) => (
            <div key={s.key} className="flex flex-col gap-1.5">
              <Label>{s.label}</Label>
              <Input name={s.key} defaultValue={settings[s.key]} />
            </div>
          ))}
          <Button type="submit">Save Currently</Button>
        </form>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-base font-semibold mb-4">Skills</h2>

        {/* Add new */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Skill name"
            value={newSkill.name}
            onChange={(e) => setNewSkill((p) => ({ ...p, name: e.target.value }))}
            className="max-w-50"
          />
          <select
            value={newSkill.category}
            onChange={(e) => setNewSkill((p) => ({ ...p, category: e.target.value }))}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Button onClick={handleAdd}>Add</Button>
        </div>

        {/* Skills by category */}
        <div className="space-y-6">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400 mb-3">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {grouped[cat]?.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-1">
                    {editingId === skill.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          className="h-7 text-xs w-28"
                        />
                        <button
                          onClick={async () => {
                            await updateSkill(skill.id, { name: editForm.name, category: editForm.category });
                            setEditingId(null);
                          }}
                          className="text-[11px] text-green-600 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[11px] text-zinc-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 pr-1"
                      >
                        <span
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => {
                            setEditingId(skill.id);
                            setEditForm({ name: skill.name, category: skill.category });
                          }}
                        >
                          {skill.name}
                        </span>
                        <form action={deleteSkill.bind(null, skill.id)} className="inline">
                          <button className="text-zinc-400 hover:text-red-500 text-xs leading-none">
                            ×
                          </button>
                        </form>
                      </Badge>
                    )}
                  </div>
                ))}
                {grouped[cat]?.length === 0 && (
                  <p className="text-xs text-zinc-400">No skills yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}