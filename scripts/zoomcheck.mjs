/** Click-through check of the zoom navigation. usage: node scripts/zoomcheck.mjs <base> <outDir> */
import { chromium } from "@playwright/test";
const [base = "http://localhost:3106", out = "."] = process.argv.slice(2);
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
await pg.goto(base + "/", { waitUntil: "load", timeout: 60000 });
await pg.waitForTimeout(1500);
await pg.click('header a[href="/lab"]');
await pg.waitForTimeout(700);
await pg.screenshot({ path: `${out}/midflight.png` });
await pg.waitForURL("**/lab", { timeout: 5000 });
await pg.waitForTimeout(600);
await pg.screenshot({ path: `${out}/arrived.png` });
console.log("nav ok, url:", pg.url());
// and a globe node click
await pg.goto(base + "/", { waitUntil: "load" });
await pg.waitForTimeout(1200);
await pg.click('a.globe-node[href="/research"]', { force: true });
await pg.waitForURL("**/research", { timeout: 5000 });
console.log("globe node ok, url:", pg.url());
await b.close();
