/** Screenshot pages of a running build for a visual check.
 *  usage: node scripts/shots.mjs <baseUrl> <outDir> */
import { chromium } from "@playwright/test";
const [base = "http://localhost:3100", out = "."] = process.argv.slice(2);
const b = await chromium.launch();
const jobs = [
  ["home2-desktop", "/", 1280, 900],
  ["research2-desktop", "/research", 1280, 900],
  ["field2-desktop", "/field/hardware", 1280, 900],
  ["home2-mobile", "/", 390, 844],
];
for (const [name, path, w, h] of jobs) {
  const pg = await b.newPage({ viewport: { width: w, height: h } });
  await pg.goto(base + path, { waitUntil: "load", timeout: 60000 });
  await pg.waitForTimeout(2500);
  await pg.screenshot({ path: `${out}/${name}.png` });
  await pg.close();
}
await b.close();
console.log("shots done");
