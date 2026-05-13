"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettings } from "@/lib/actions/settings";

export function SettingsForm({ data }: { data: Record<string, string> }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    await updateSettings(formData);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <form action={handleSubmit} className="max-w-xl space-y-5">
      <div className="flex flex-col gap-1.5">
        <Label>Bio</Label>
        <Textarea name="bio" defaultValue={data.bio} rows={4} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>GitHub URL</Label>
        <Input name="github" defaultValue={data.github} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>LinkedIn URL</Label>
        <Input name="linkedin" defaultValue={data.linkedin} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Contact Email</Label>
        <Input name="email" defaultValue={data.email} />
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
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save Settings"}
        </Button>
        {status === "saved" && (
          <span className="text-sm text-green-600 dark:text-green-400">
            ✓ Saved
          </span>
        )}
      </div>
    </form>
  );
}