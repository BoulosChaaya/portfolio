import { expect, test } from "@playwright/test";
import { ADMIN_PAGES, signIn } from "./helpers";

// The dashboard is used from a phone: nothing may sit beyond the right edge of the screen,
// where it can only be reached by scrolling the whole page sideways.
test.use({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });

for (const path of ADMIN_PAGES) {
  test(`${path} fits a phone screen`, async ({ page }) => {
    await signIn(page);
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Open every editor on the page, so the forms are checked too.
    for (const edit of await page.getByRole("button", { name: "Edit" }).all()) { await edit.click(); break; }
    const offscreen = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      return [...document.querySelectorAll<HTMLElement>("main button, main a, main input, main textarea, main select, main td, main th")]
        .filter((el) => { const box = el.getBoundingClientRect(); return box.width > 0 && box.right > width + 1; })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("name") || "").trim().slice(0, 30)}" ends at ${Math.round(el.getBoundingClientRect().right)}px`)
        .slice(0, 8);
    });
    expect(offscreen, `${path} on a 360px screen`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
