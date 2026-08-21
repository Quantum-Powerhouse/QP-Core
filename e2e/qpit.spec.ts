import { test, expect, type Page } from "@playwright/test";

/**
 * QPIT integration tests: mounting, cursor physics, dock/roam pointer
 * gating, poke dialogue, and non-interference with normal page use.
 */

const QPIT = 'button[aria-label^="Poke QPIT"]';

async function wrapperX(page: Page): Promise<number> {
  return page.evaluate((sel) => {
    const btn = document.querySelector(sel)!;
    const wrap = btn.closest("div.fixed.left-0.top-0") as HTMLElement;
    const nums = getComputedStyle(wrap).transform.match(/[-\d.]+/g);
    return nums ? Number(nums[4]) : NaN;
  }, QPIT);
}

test("QPIT mounts with its WebGL form and entrance completes", async ({ page }) => {
  await page.goto("/");
  const orb = page.locator(QPIT);
  await expect(orb).toBeVisible({ timeout: 15_000 });
  await expect(orb.locator("canvas")).toBeAttached();
  // Entrance animation finishes: the inner wrapper reaches full scale.
  await page.waitForTimeout(1500);
  const scaleDone = await page.evaluate((sel) => {
    const btn = document.querySelector(sel)!;
    const wrap = btn.closest("div.fixed.left-0.top-0") as HTMLElement;
    const nums = getComputedStyle(wrap).transform.match(/[-\d.]+/g);
    return nums ? Math.abs(Number(nums[0])) > 0.5 : false;
  }, QPIT);
  expect(scaleDone).toBe(true);
});

test("QPIT follows the cursor and swings while roaming", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(QPIT)).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1200);

  const dockX = await wrapperX(page);
  // Sweep the mouse to the left half of the viewport.
  for (let i = 0; i <= 10; i++) {
    await page.mouse.move(700 - i * 40, 300);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(700);
  const roamX = await wrapperX(page);
  expect(Math.abs(roamX - dockX)).toBeGreaterThan(150);

  // While roaming, QPIT must not intercept pointer events.
  const pe = await page.evaluate((sel) => {
    const btn = document.querySelector(sel)!;
    const wrap = btn.closest("div.fixed.left-0.top-0") as HTMLElement;
    return getComputedStyle(wrap).pointerEvents;
  }, QPIT);
  expect(pe).toBe("none");
});

test("QPIT returns to its dock after the cursor goes idle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(QPIT)).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1200);
  const dockX = await wrapperX(page);

  for (let i = 0; i <= 6; i++) {
    await page.mouse.move(500 - i * 30, 320);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(500);
  expect(Math.abs((await wrapperX(page)) - dockX)).toBeGreaterThan(100);

  // Idle past the dock timeout; the spring carries it home.
  await page.waitForTimeout(5200);
  expect(Math.abs((await wrapperX(page)) - dockX)).toBeLessThan(30);
});

test("poking QPIT with a real mouse click produces a dialogue line", async ({ page }) => {
  await page.goto("/");
  const orb = page.locator(QPIT);
  await expect(orb).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1200);

  // Move the mouse so QPIT roams and hangs ~92px below the cursor, then
  // click on its body — the roaming hit-test path a real user exercises.
  // Aim over hero prose (no links beneath), so the poke hit-test wins.
  for (let i = 0; i <= 6; i++) {
    await page.mouse.move(200 + i * 10, 190);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900); // let the spring settle under the cursor
  const pet = await page.evaluate((sel) => {
    const btn = document.querySelector(sel)!;
    const wrap = btn.closest("div.fixed.left-0.top-0") as HTMLElement;
    const nums = getComputedStyle(wrap).transform.match(/[-\d.]+/g)!;
    return { x: Number(nums[4]), y: Number(nums[5]) };
  }, QPIT);
  await page.mouse.click(pet.x, pet.y);
  await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('[role="status"]')).not.toBeEmpty();
});

test("keyboard users can poke QPIT via focus + Enter", async ({ page }) => {
  await page.goto("/");
  const orb = page.locator(QPIT);
  await expect(orb).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1000);
  await orb.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 3000 });
});

test("QPIT never blocks clicking page content while roaming", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(QPIT)).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1200);

  // Drag the cursor right onto a nav link so QPIT trails around it.
  const nav = page.locator('a[href="/research"]').first();
  const box = (await nav.boundingBox())!;
  for (let i = 0; i <= 8; i++) {
    await page.mouse.move(box.x - 200 + i * 25, box.y + box.height / 2);
    await page.waitForTimeout(25);
  }
  await nav.click();
  await page.waitForURL("**/research", { timeout: 15_000 });
});
