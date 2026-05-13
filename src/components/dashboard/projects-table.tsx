"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createProject, updateProject, deleteProject, togglePublished } from "@/lib/actions/projects";

type Project = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  techStack: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  category: string | null;
  featured: boolean | null;
  published: boolean | null;
  order: number | null;
};

const emptyForm = {
  title: "", slug: "", excerpt: "", description: "",
  techStack: "", liveUrl: "", githubUrl: "", category: "", featured: false,
};

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: typeof emptyForm & { published?: boolean };
  onSubmit: (data: any) => Promise<void>;
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
    <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-white dark:bg-zinc-900 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Title</Label>
          <Input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Slug</Label>
          <Input name="slug" value={form.slug} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Input name="category" value={form.category} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Tech Stack (comma separated)</Label>
          <Input name="techStack" value={form.techStack} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Live URL</Label>
          <Input name="liveUrl" value={form.liveUrl} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>GitHub URL</Label>
          <Input name="githubUrl" value={form.githubUrl} onChange={handleChange} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Excerpt</Label>
        <Input name="excerpt" value={form.excerpt} onChange={handleChange} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Description</Label>
        <Textarea name="description" value={form.description} onChange={handleChange} rows={3} />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={!!form.featured}
          onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
          className="w-4 h-4"
        />
        <Label htmlFor="featured">Featured</Label>
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

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleCreate(data: typeof emptyForm) {
    await createProject(data);
    setAdding(false);
  }

  async function handleUpdate(id: number, data: any) {
    await updateProject(id, { ...data, published: true });
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      {!adding && (
        <Button onClick={() => setAdding(true)}>+ Add Project</Button>
      )}

      {adding && (
        <ProjectForm
          initial={emptyForm}
          onSubmit={handleCreate}
          onCancel={() => setAdding(false)}
          submitLabel="Save Project"
        />
      )}

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Title</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Category</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">No projects yet</td>
              </tr>
            )}
            {projects.map((p) => (
              <React.Fragment key={p.id}>
                <tr key={p.id} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.category || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.published ? "default" : "secondary"}>
                      {p.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        {editingId === p.id ? "Close" : "Edit"}
                      </button>
                      <form action={togglePublished.bind(null, p.id, !p.published)}>
                        <button className="text-zinc-500 text-xs hover:underline">
                          {p.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={deleteProject.bind(null, p.id)}>
                        <button className="text-red-500 text-xs hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
                {editingId === p.id && (
                  <tr key={`edit-${p.id}`}>
                    <td colSpan={4} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-800">
                      <ProjectForm
                        initial={{
                          title: p.title,
                          slug: p.slug,
                          excerpt: p.excerpt || "",
                          description: p.description || "",
                          techStack: p.techStack || "",
                          liveUrl: p.liveUrl || "",
                          githubUrl: p.githubUrl || "",
                          category: p.category || "",
                          featured: p.featured || false,
                        }}
                        onSubmit={(data) => handleUpdate(p.id, data)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Update Project"
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