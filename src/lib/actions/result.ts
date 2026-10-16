import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { assertAdmin, NotSignedIn } from "@/lib/dal";

/**
 * What every admin action answers. Actions never throw to the browser: a thrown error from a
 * server action replaced the whole dashboard with "This page couldn't load", or left a form on
 * "Saving..." for good. The form shows `error` and stays usable.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

/** Messages for the database's unique constraints, by constraint name. */
const UNIQUE: Record<string, string> = {
  projects_slug_unique: "Another project already uses that slug.",
  posts_slug_unique: "Another post already uses that slug.",
};

function codeOf(error: unknown): { code?: string; constraint?: string } {
  // Drizzle wraps the driver's error (node-postgres or Neon) in `cause`.
  for (let current = error, depth = 0; current && depth < 5; current = (current as { cause?: unknown }).cause, depth++) {
    const { code, constraint } = current as { code?: unknown; constraint?: unknown };
    if (typeof code === "string") return { code, constraint: typeof constraint === "string" ? constraint : undefined };
  }
  return {};
}

/** Checks the admin, validates `input` with `schema`, runs `write`, and turns failures into a message. */
export async function adminAction<S extends z.ZodType>(
  schema: S,
  input: unknown,
  write: (data: z.infer<S>) => Promise<void>,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.join(".");
      return { ok: false, error: field ? `${field}: ${issue.message}` : (issue?.message ?? "Invalid input.") };
    }
    await write(parsed.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof NotSignedIn) return { ok: false, error: error.message };
    const { code, constraint } = codeOf(error);
    if (code === "23505") return { ok: false, error: (constraint && UNIQUE[constraint]) || "That value is already used." };
    // Anything else is a bug or an outage: log it with a reference the admin can quote.
    const reference = randomUUID().slice(0, 8);
    console.error(`admin action failed [ref ${reference}]`, error);
    return { ok: false, error: `Could not save. Try again; if it keeps failing, the server log has ref ${reference}.` };
  }
}

// Shared field rules.
export const text = (max: number) => z.string().trim().max(max, `at most ${max} characters`);
export const required = (max: number) => text(max).min(1, "required");
export const slug = z.string().trim().min(1, "required").max(100, "at most 100 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase letters, numbers and single hyphens, e.g. my-project");
/** Empty, or an http(s) address: a javascript: link would run when a visitor clicks it. */
export const url = z.string().trim().max(500, "at most 500 characters")
  .refine((value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value), "must start with https:// or http://");
export const id = z.number().int().positive();
