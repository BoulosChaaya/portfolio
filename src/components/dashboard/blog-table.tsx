"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createPost, updatePost, deletePost, togglePostPublished, type PostFields } from "@/lib/actions/blog";
import type { ActionResult } from "@/lib/actions/result";
import { ActionError, RowAction, useAdminAction } from "./use-admin-action";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  published: boolean | null;
};

const emptyForm: PostFields = {
  title: "", slug: "", excerpt: "", content: "", category: "",
};

function PostForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: PostFields;
  onSubmit: (data: PostFields) => Promise<ActionResult>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  const { pending: loading, error, run } = useAdminAction();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(() => onSubmit(form), onCancel);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label>Excerpt</Label>
          <Input name="excerpt" value={form.excerpt} onChange={handleChange} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Content</Label>
        <Textarea name="content" value={form.content} onChange={handleChange} rows={8} />
      </div>
      <ActionError error={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function BlogTable({ posts }: { posts: Post[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);


  return (
    <div className="space-y-6">
      {!adding && (
        <Button onClick={() => setAdding(true)}>+ New Post</Button>
      )}

      {adding && (
        <div className="border rounded-xl p-6 bg-white dark:bg-zinc-900">
          <h3 className="font-medium mb-4">New Post</h3>
          <PostForm
            initial={emptyForm}
            onSubmit={createPost}
            onCancel={() => setAdding(false)}
            submitLabel="Save Draft"
          />
        </div>
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
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">No posts yet</td>
              </tr>
            )}
            {posts.map((p) => (
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
                      <RowAction label={p.published ? "Unpublish" : "Publish"} action={() => togglePostPublished(p.id, !p.published)} />
                      <RowAction label="Delete" className="text-red-500" confirmText={`Delete "${p.title}"? This cannot be undone.`} action={() => deletePost(p.id)} />
                    </div>
                  </td>
                </tr>
                {editingId === p.id && (
                  <tr key={`edit-${p.id}`}>
                    <td colSpan={4} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-800">
                      <PostForm
                        initial={{
                          title: p.title,
                          slug: p.slug,
                          excerpt: p.excerpt || "",
                          content: p.content || "",
                          category: p.category || "",
                        }}
                        onSubmit={(data) => updatePost(p.id, data)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Update Post"
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