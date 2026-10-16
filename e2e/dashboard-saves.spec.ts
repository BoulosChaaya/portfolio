import { expect, test, type Page } from "@playwright/test";
import { query, signIn } from "./helpers";

// Saves in the dashboard either succeed or say why, and the page stays usable either way.

test.beforeAll(async () => {
  await query("DELETE FROM projects WHERE slug IN ('save-target', 'taken-slug', 'draft-target')");
  await query(`INSERT INTO projects (slug, title, excerpt, published, "order") VALUES
    ('save-target', 'Save target', 'Before', true, 10),
    ('taken-slug', 'Slug owner', 'Owns the slug', true, 11),
    ('draft-target', 'Draft target', 'A draft', false, 12)`);
});

const project = async (slug: string) => (await query<{ excerpt: string; slug: string; published: boolean; live_url: string | null }>(
  "SELECT excerpt, slug, published, live_url FROM projects WHERE slug = $1", [slug]))[0];

async function openEdit(page: Page, title: string) {
  await page.goto("/admin/projects");
  await page.getByRole("row", { name: new RegExp(title) }).getByRole("button", { name: "Edit" }).click();
}

test("an edit saves and the form closes", async ({ page }) => {
  await signIn(page);
  await openEdit(page, "Save target");
  await page.locator('input[name="excerpt"]').fill("After");
  await page.getByRole("button", { name: "Update Project" }).click();
  await expect(page.locator('input[name="excerpt"]')).toHaveCount(0);
  expect((await project("save-target"))?.excerpt).toBe("After");
});

test("a refused edit says why, and the form stays usable", async ({ page }) => {
  await signIn(page);
  await openEdit(page, "Save target");
  await page.locator('input[name="slug"]').fill("taken-slug");
  await page.getByRole("button", { name: "Update Project" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Another project already uses that slug." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Update Project" })).toBeEnabled();

  // A javascript: address would run when a visitor clicks "Live".
  await page.locator('input[name="slug"]').fill("save-target");
  await page.locator('input[name="liveUrl"]').fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Update Project" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "liveUrl: must start with https:// or http://" })).toBeVisible();
  expect(await project("save-target")).toMatchObject({ slug: "save-target", live_url: "" });

  // Fixing the input saves on the same form, without a reload.
  await page.locator('input[name="liveUrl"]').fill("https://example.com");
  await page.getByRole("button", { name: "Update Project" }).click();
  await expect(page.locator('input[name="excerpt"]')).toHaveCount(0);
  expect((await project("save-target"))?.live_url).toBe("https://example.com");
});

test("editing a draft keeps it a draft", async ({ page }) => {
  await signIn(page);
  await openEdit(page, "Draft target");
  await page.locator('input[name="excerpt"]').fill("Typo fixed");
  await page.getByRole("button", { name: "Update Project" }).click();
  await expect(page.locator('input[name="excerpt"]')).toHaveCount(0);
  expect(await project("draft-target")).toMatchObject({ excerpt: "Typo fixed", published: false });
});

test("when the session has ended, a row action says so and the page stays", async ({ page, context }) => {
  await signIn(page);
  await page.goto("/admin/projects");
  const row = page.getByRole("row", { name: /Draft target/ });
  await context.clearCookies();
  await row.getByRole("button", { name: "Publish" }).click();
  await expect(row.getByRole("alert")).toHaveText("Your session has ended. Sign in again.");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  expect((await project("draft-target"))?.published).toBe(false);
});

test("publish, unpublish and delete work from the row, with a confirmation before deleting", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/projects");
  const row = page.getByRole("row", { name: /Draft target/ });
  await row.getByRole("button", { name: "Publish" }).click();
  await expect(row.getByText("Published")).toBeVisible();
  expect((await project("draft-target"))?.published).toBe(true);

  page.once("dialog", (dialog) => dialog.dismiss());
  await row.getByRole("button", { name: "Delete" }).click();
  await page.waitForTimeout(500);
  expect(await project("draft-target")).toBeTruthy();
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("row", { name: /Draft target/ })).toHaveCount(0);
  expect(await project("draft-target")).toBeUndefined();
});

test("settings save, including switching 'Available for work' off", async ({ page }) => {
  const available = async () => (await query<{ value: string }>("SELECT value FROM settings WHERE key = 'available'"))[0]?.value;
  await signIn(page);
  for (const want of [true, false]) {
    await page.goto("/admin/settings");
    const box = page.getByLabel("Available for work");
    if ((await box.isChecked()) !== want) await box.click();
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByRole("status")).toHaveText("✓ Saved");
    expect(await available()).toBe(String(want));
  }
  await page.getByLabel("GitHub URL").fill("not a link");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "github: must start with https:// or http://" })).toBeVisible();
});

test("a new post is a draft until published, then it is on the blog", async ({ page }) => {
  await query("DELETE FROM posts WHERE slug = 'e2e-post'");
  await signIn(page);
  await page.goto("/admin/blog");
  await page.getByRole("button", { name: "+ New Post" }).click();
  await page.locator('input[name="title"]').fill("End-to-end post");
  await page.locator('input[name="slug"]').fill("e2e-post");
  await page.locator('textarea[name="content"]').fill("First paragraph.\nSecond paragraph.");
  await page.getByRole("button", { name: "Save Draft" }).click();
  const row = page.getByRole("row", { name: /End-to-end post/ });
  await expect(row.getByText("Draft")).toBeVisible();
  expect((await page.request.get("/blog/e2e-post")).status()).toBe(404);

  await row.getByRole("button", { name: "Publish" }).click();
  await expect(row.getByText("Published")).toBeVisible();
  await page.goto("/blog/e2e-post");
  await expect(page.getByRole("heading", { name: "End-to-end post" })).toBeVisible();
  await page.goto("/blog");
  await expect(page.getByText("End-to-end post")).toBeVisible();
});
