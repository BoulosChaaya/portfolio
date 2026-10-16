import { expect, test } from "@playwright/test";

test("the home page shows what is being built from the dashboard's settings, and no placeholder text", async ({ page }) => {
  await page.goto("/");
  const building = page.locator("section", { hasText: "Currently Building" });
  await expect(building.getByRole("heading", { name: "Test Engine" })).toBeVisible();
  await expect(building.getByText("A seeded description of what is being built.")).toBeVisible();
  await expect(page.getByText(/SaaS|AWS/)).toHaveCount(0);
});

test("a post renders headings and lists, and shows markup as text", async ({ page }) => {
  await page.goto("/blog/formatted");
  await expect(page).toHaveTitle("Formatted post — Boulos Chaaya");
  await expect(page.getByRole("heading", { level: 2, name: "A heading" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveText(["first point", "second point"]);
  await expect(page.getByText("Closing <script>window.injected = true</script> text.")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { injected?: boolean }).injected)).toBeUndefined();
});

test("the about page counts live apps, not SaaS products", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByText("Live apps")).toBeVisible();
  await expect(page.getByText(/SaaS/)).toHaveCount(0);
});
