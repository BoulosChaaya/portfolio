import { expect, type Page } from "@playwright/test";
import pg from "pg";

export const ADMIN = { email: "admin@e2e.test", password: "e2e-admin-password" };

export const ADMIN_PAGES = ["/admin", "/admin/projects", "/admin/blog", "/admin/contacts", "/admin/experience", "/admin/settings", "/admin/skills"];

/** Seeded text that is never public: a visitor's message, an unpublished post and project. */
export const PRIVATE_TEXT = ["visitor@private.test", "Private Visitor", "PRIVATE-MESSAGE-123", "Secret draft post", "Unlisted project"];

export async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try { return (await client.query(sql, params)).rows as T[]; } finally { await client.end(); }
}
