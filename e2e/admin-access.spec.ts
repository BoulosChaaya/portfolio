import { expect, test } from "@playwright/test";
import { ADMIN_PAGES, PRIVATE_TEXT, query, signIn } from "./helpers";

// The headers a browser sends when it moves to an admin page from inside the admin area, captured
// from a real navigation. They ask Next.js to render only the new page segment: the admin layout is
// marked as already on screen and is not run again.
function navigationHeaders(path: string): Record<string, string> {
  const page = ["__PAGE__", {}, null, null, 4096];
  const segment = path === "/admin" ? ["admin", { children: [...page.slice(0, 3), "refetch", 4096] }, null, null, 4096]
    : ["admin", { children: [path.split("/")[2], { children: page }, null, "refetch", 4096] }, null, null, 4096];
  const tree = ["", { children: segment }, null, null, 4112];
  return { RSC: "1", "Next-Router-State-Tree": encodeURIComponent(JSON.stringify(tree)), "Next-Url": "/admin" };
}

test.describe("signed out", () => {
  for (const path of ADMIN_PAGES) {
    test(`${path} redirects to sign-in and returns no admin data, as a page or a client navigation`, async ({ request }) => {
      const page = await request.get(path, { maxRedirects: 0 });
      expect(page.status()).toBe(307);
      expect(page.headers()["location"]).toMatch(/\/login$/);

      const variants: Record<string, string>[] = [{ RSC: "1" }, navigationHeaders(path)];
      for (const headers of variants) {
        const response = await request.get(path, { headers, maxRedirects: 0 });
        const body = await response.text();
        if (headers["Next-Router-State-Tree"]) expect(response.status(), `${path}: a navigation request must be understood, not rejected`).toBeLessThan(500);
        for (const text of PRIVATE_TEXT) expect(body, `${path} with ${Object.keys(headers).join(", ")}`).not.toContain(text);
      }
    });
  }

  test("the contacts export answers 401 without data", async ({ request }) => {
    const response = await request.get("/api/admin/contacts/export");
    expect(response.status()).toBe(401);
    expect(await response.text()).not.toContain("visitor@private.test");
  });
});

test("signed in, the admin pages show the data", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/contacts");
  await expect(page.getByText("visitor@private.test")).toBeVisible();
  await page.goto("/admin/blog");
  await expect(page.getByText("Secret draft post")).toBeVisible();
});

test("an admin action sent after the session ended changes nothing", async ({ page, context }) => {
  await signIn(page);
  await page.goto("/admin/projects");
  const row = page.getByRole("row", { name: /Unlisted project/ });
  await expect(row.getByText("Draft")).toBeVisible();
  await context.clearCookies();
  await row.getByRole("button", { name: "Publish" }).click();
  await expect.poll(async () => (await query<{ published: boolean }>("SELECT published FROM projects WHERE slug = 'unlisted'"))[0]?.published, { timeout: 5000 }).toBe(false);
  // Give a refused write time to land if it were going to.
  await page.waitForTimeout(1500);
  expect((await query<{ published: boolean }>("SELECT published FROM projects WHERE slug = 'unlisted'"))[0]?.published).toBe(false);
});

test("the session lasts until Sign out is clicked, and only a click signs out", async ({ page }) => {
  await signIn(page);
  // Visit every admin page, giving Next.js time to prefetch every link in view.
  for (const path of ADMIN_PAGES) { await page.goto(path); await page.waitForLoadState("networkidle"); }
  await page.goto("/admin/contacts");
  await expect(page.getByText("visitor@private.test")).toBeVisible();
  // Another site linking to the old sign-out address does not end the session.
  await page.request.get("/api/auth/signout");
  await page.goto("/admin/contacts");
  await expect(page.getByText("visitor@private.test")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/login");
  expect((await page.request.get("/admin/contacts", { maxRedirects: 0 })).status()).toBe(307);
});
