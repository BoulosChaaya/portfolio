"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettings } from "@/lib/actions/settings";
import { ActionError, useAdminAction } from "./use-admin-action";

export function SettingsForm({ data }: { data: Record<string, string> }) {
  const { pending, error, run } = useAdminAction();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "");
    setSaved(false);
    run(() => updateSettings({
      bio: value("bio"),
      github: value("github"),
      linkedin: value("linkedin"),
      email: value("email"),
      // An unticked checkbox sends nothing, which used to leave "available" switched on for good.
      available: form.get("available") === "on" ? "true" : "false",
    }), () => { setSaved(true); setTimeout(() => setSaved(false), 2500); });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={data.bio} rows={4} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github">GitHub URL</Label>
        <Input id="github" name="github" defaultValue={data.github} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input id="linkedin" name="linkedin" defaultValue={data.linkedin} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Contact Email</Label>
        <Input id="email" name="email" defaultValue={data.email} />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="available"
          id="available"
          defaultChecked={data.available === "true"}
          className="w-4 h-4"
        />
        <Label htmlFor="available">Available for work</Label>
      </div>
      <ActionError error={error} />
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Settings"}
        </Button>
        {saved && (
          <span role="status" className="text-sm text-green-600 dark:text-green-400">
            ✓ Saved
          </span>
        )}
      </div>
    </form>
  );
}
