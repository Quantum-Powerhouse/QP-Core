/**
 * Renders the research paper (HTML in the research repository) to PDF with
 * headless Chromium — the same Playwright the e2e suite uses. Usage:
 *   node scripts/render-paper.mjs <paper.html> <out.pdf>
 */
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error("usage: node scripts/render-paper.mjs <paper.html> <out.pdf>");
  process.exit(1);
}
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(src).href, { waitUntil: "load" });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  margin: { top: "22mm", bottom: "24mm", left: "20mm", right: "20mm" },
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate:
    '<div style="font-size:8px;color:#666;width:100%;text-align:center;font-family:serif">Sadeqi — CI/CD regression testing for quantum software: a prior-art study · v1.1 · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
});
await browser.close();
console.log("pdf written:", out);
