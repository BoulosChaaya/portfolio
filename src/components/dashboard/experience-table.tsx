"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createExperience, updateExperience, deleteExperience } from "@/lib/actions/experience";

type Experience = {
  id: number;
  company: string;
  role: string;
  location: string | null;
  duration: string | null;
  description: string | null;
};

const emptyForm = {
  company: "", role: "", location: "", duration: "", description: "",
};

function ExperienceForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: typeof emptyForm;
  onSubmit: (data: typeof emptyForm) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Company</Label>
          <Input name="company" value={form.company} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Role</Label>
          <Input name="role" value={form.role} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Location</Label>
          <Input name="location" value={form.location} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Duration</Label>
          <Input name="duration" value={form.duration} onChange={handleChange} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Description</Label>
        <Textarea name="description" value={form.description} onChange={handleChange} rows={3} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function ExperienceTable({ items }: { items: Experience[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleCreate(data: typeof emptyForm) {
    await createExperience(data);
    setAdding(false);
  }

  async function handleUpdate(id: number, data: typeof emptyForm) {
    await updateExperience(id, data);
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      {!adding && (
        <Button onClick={() => setAdding(true)}>+ Add Experience</Button>
      )}

      {adding && (
        <div className="border rounded-xl p-6 bg-white dark:bg-zinc-900">
          <ExperienceForm
            initial={emptyForm}
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
            submitLabel="Save"
          />
        </div>
      )}

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Company</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Duration</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">No experience yet</td>
              </tr>
            )}
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr key={item.id} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3 font-medium">{item.company}</td>
                  <td className="px-4 py-3 text-zinc-500">{item.role}</td>
                  <td className="px-4 py-3 text-zinc-500">{item.duration || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        {editingId === item.id ? "Close" : "Edit"}
                      </button>
                      <form action={deleteExperience.bind(null, item.id)}>
                        <button className="text-red-500 text-xs hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
                {editingId === item.id && (
                  <tr key={`edit-${item.id}`}>
                    <td colSpan={4} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-800">
                      <ExperienceForm
                        initial={{
                          company: item.company,
                          role: item.role,
                          location: item.location || "",
                          duration: item.duration || "",
                          description: item.description || "",
                        }}
                        onSubmit={(data) => handleUpdate(item.id, data)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Update"
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}