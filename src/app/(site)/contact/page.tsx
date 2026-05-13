"use client";

import { useState } from "react";
import { submitContact } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);
    setStatus(result?.success ? "success" : "error");
  }

  return (
    <main>
      <div className="max-w-xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <p className="text-[13px] uppercase tracking-widest text-zinc-400 mb-4">
          Get in touch
        </p>
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-tight mb-4">
          Contact
        </h1>
        <p className="text-[15px] text-zinc-500 mb-10 leading-relaxed">
          Have a project in mind or want to work together? Send me a message and
          I&apos;ll get back to you.
        </p>

        {status === "success" ? (
          <div className="border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 rounded-xl p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-lg">✓</span>
            </div>
            <p className="text-[15px] font-medium text-green-700 dark:text-green-400 mb-1">
              Message sent.
            </p>
            <p className="text-[13px] text-green-600 dark:text-green-500">
              I&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Honeypot — hidden from humans, bots fill it */}
            <input
              type="text"
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required maxLength={100} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={320} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" maxLength={200} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                required
                maxLength={2000}
              />
            </div>
            {status === "error" && (
              <p className="text-[13px] text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
            <div className="flex">
              <Button
                type="submit"
                disabled={status === "loading"}
                className="px-8 text-white hover:opacity-90 ml-auto"
                style={{ background: "#e84c1e" }}
              >
                {status === "loading" ? "Sending..." : "Send message →"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}