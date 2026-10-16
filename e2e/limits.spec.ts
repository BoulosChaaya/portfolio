import { expect, test, type Page } from "@playwright/test";
import { ADMIN, query, signIn } from "./helpers";

test.afterAll(async () => {
  await query("DELETE FROM login_throttle");
});

async function attempt(page: Page, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("after 5 wrong passwords, even the right one is refused for 15 minutes", async ({ page }) => {
  await query("DELETE FROM login_throttle");
  for (let i = 0; i < 5; i++) {
    await attempt(page, `wrong-${i}`);
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  }
  await attempt(page, ADMIN.password);
  await expect(page.getByText("Too many failed attempts. Wait 15 minutes and try again.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);

  // Once the window has passed, the right password works again and clears the count.
  await query("UPDATE login_throttle SET window_start = now() - interval '16 minutes'");
  await signIn(page);
  expect(await query("SELECT key FROM login_throttle WHERE key LIKE 'email:%'")).toEqual([]);
});

async function sendMessage(page: Page, email: string, extra: Record<string, string> = {}) {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Limit Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Message").fill("Hello from the limits test.");
  for (const [name, value] of Object.entries(extra)) await page.locator(`input[name="${name}"]`).evaluate((el, v) => { (el as HTMLInputElement).value = v; }, value);
  await page.getByRole("button", { name: /Send message/ }).click();
}

test("the contact form takes 3 messages an hour from one sender, and ignores bots", async ({ page }) => {
  const sender = "limit.tester@example.test";
  await query("DELETE FROM contacts WHERE lower(email) = $1", [sender]);
  for (let i = 0; i < 3; i++) {
    await sendMessage(page, i === 1 ? sender.toUpperCase() : sender);
    await expect(page.getByText(/sent|thank/i).first()).toBeVisible();
  }
  await sendMessage(page, sender);
  await expect(page.getByRole("alert").filter({ hasText: "You have sent several messages in the last hour." })).toBeVisible();
  expect((await query("SELECT id FROM contacts WHERE lower(email) = $1", [sender])).length).toBe(3);

  // The hidden honeypot field: the bot is told it worked, and nothing is stored.
  await sendMessage(page, "bot@example.test", { website: "https://spam.example" });
  await expect(page.getByText(/sent|thank/i).first()).toBeVisible();
  expect(await query("SELECT id FROM contacts WHERE email = 'bot@example.test'")).toEqual([]);
});

test("the contacts export keeps visitors' text from running as spreadsheet formulas", async ({ page }) => {
  await query("INSERT INTO contacts (name, email, message) VALUES ('=HYPERLINK(\"https://evil.example\",\"x\")', 'formula@example.test', '+1-2')");
  await signIn(page);
  const csv = await (await page.request.get("/api/admin/contacts/export")).text();
  const line = csv.split("\n").find((row) => row.includes("formula@example.test"))!;
  expect(line).toContain(`"'=HYPERLINK(""https://evil.example"",""x"")"`);
  expect(line).toContain(`"'+1-2"`);
});

test("pages carry the security headers", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["content-security-policy"]).toBe("object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
});
