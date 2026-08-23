import { test, expect } from "@playwright/test";

/**
 * Regression test for the phone-navigation bug: below the `sm` breakpoint the
 * header used to hide every link with nothing in their place. All sections
 * must be reachable from a phone at common widths.
 */

const WIDTHS = [375, 390, 428];
const SECTIONS = ["Arcade", "Learn", "Field", "Research", "Docs", "Builder"];

for (const width of WIDTHS) {
  test(`mobile nav reaches every section at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    // desktop nav is hidden on phones
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    const menu = page.getByRole("button", { name: "Open menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    const panel = page.getByRole("navigation", { name: "Site sections" });
    await expect(panel).toBeVisible();
    for (const s of SECTIONS) await expect(panel.getByRole("link", { name: s })).toBeVisible();
    // navigating closes the menu and actually moves
    await panel.getByRole("link", { name: "Field" }).click();
    await page.waitForURL("**/field", { timeout: 15_000 });
    await expect(page.getByRole("navigation", { name: "Site sections" })).toBeHidden();
  });
}
