import { chromium } from "@playwright/test";
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
await pg.goto("https://quantum.sadeqi.me/lab#c=2:h0,cx1.0", { waitUntil: "load", timeout: 60000 });
await pg.waitForTimeout(2500);
const qasm = await pg.evaluate(() => document.body.innerText);
console.log("bell from link:", qasm.includes("cx q[0]") || qasm.includes("cx q[1]") ? "circuit loaded from URL" : "NOT LOADED");
await b.close();
