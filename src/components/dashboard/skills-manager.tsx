"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createSkill, deleteSkill, updateSkill } from "@/lib/actions/skills";
import { updateSettings, type SettingsFields } from "@/lib/actions/settings";
import { ActionError, RowAction, useAdminAction } from "./use-admin-action";

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
  const stats = useAdminAction();
  const current = useAdminAction();
  const add = useAdminAction();
  const edit = useAdminAction();
  const [saved, setSaved] = useState<"stats" | "currently" | null>(null);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {} as Record<string, Skill[]>);

  function handleAdd() {
    if (!newSkill.name.trim()) return;
    add.run(() => createSkill({ ...newSkill, order: skills.length }), () => setNewSkill({ name: "", category: "Frontend" }));
  }

  /** Saves only the fields of the submitted form; each form's keys are listed in it. */
  function saveSettings(which: "stats" | "currently", action: ReturnType<typeof useAdminAction>) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = Object.fromEntries([...new FormData(e.currentTarget)].map(([key, value]) => [key, String(value)])) as SettingsFields;
      setSaved(null);
      action.run(() => updateSettings(values), () => { setSaved(which); setTimeout(() => setSaved(null), 2500); });
    };
  }

  return (
    <div className="space-y-10 max-w-2xl">

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold mb-4">About Page Stats</h2>
        <form onSubmit={saveSettings("stats", stats)} className="grid grid-cols-2 gap-4">
          {[
            { key: "stat_projects", label: "Projects stat" },
            { key: "stat_years", label: "Years stat" },
            { key: "stat_saas", label: "Live apps stat" },
            { key: "stat_location", label: "Location stat" },
          ].map((s) => (
            <div key={s.key} className="flex flex-col gap-1.5">
              <Label>{s.label}</Label>
              <Input name={s.key} defaultValue={settings[s.key]} />
            </div>
          ))}
          <div className="col-span-2"><ActionError error={stats.error} /></div>
          <div className="col-span-2 flex items-center gap-4">
            <Button type="submit" disabled={stats.pending}>
              {stats.pending ? "Saving..." : "Save Stats"}
            </Button>
            {saved === "stats" && (
              <span role="status" className="text-sm text-green-600">✓ Saved</span>
            )}
          </div>
        </form>
      </div>

      {/* Currently */}
      <div>
        <h2 className="text-base font-semibold mb-4">Currently Section</h2>
        <form onSubmit={saveSettings("currently", current)} className="space-y-4">
          {[
            { key: "currently_building", label: "Building" },
            { key: "currently_building_detail", label: "Building: one-line description (home page)" },
            { key: "currently_learning", label: "Learning" },
            { key: "currently_open", label: "Open to" },
          ].map((s) => (
            <div key={s.key} className="flex flex-col gap-1.5">
              <Label>{s.label}</Label>
              <Input name={s.key} defaultValue={settings[s.key]} />
            </div>
          ))}
          <ActionError error={current.error} />
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={current.pending}>{current.pending ? "Saving..." : "Save Currently"}</Button>
            {saved === "currently" && <span role="status" className="text-sm text-green-600">✓ Saved</span>}
          </div>
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
          <Button onClick={handleAdd} disabled={add.pending}>{add.pending ? "Adding..." : "Add"}</Button>
        </div>
        <div className="-mt-4 mb-6"><ActionError error={add.error ?? edit.error} /></div>

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
                          disabled={edit.pending}
                          onClick={() => edit.run(() => updateSkill(skill.id, { name: editForm.name, category: editForm.category }), () => setEditingId(null))}
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
                        <RowAction label="×" className="text-zinc-400 hover:text-red-500" confirmText={`Remove the skill "${skill.name}"?`} action={() => deleteSkill(skill.id)} />
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