/**
 * Crawls the production sitemap, extracts every internal href and anchor,
 * and reports broken pages or missing anchor targets. Usage:
 *   node scripts/link-audit.mjs https://quantum.sadeqi.me
 */
const base = (process.argv[2] ?? "https://quantum.sadeqi.me").replace(/\/$/, "");
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(base, "")).filter((p) => p.startsWith("/"));
const seen = new Map();
let broken = 0;
for (const page of pages) {
  const res = await fetch(`${base}${page}`);
  const html = await res.text();
  if (!res.ok) { console.log(`PAGE ${page} -> ${res.status}`); broken++; continue; }
  const idsOf = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g), ...h.matchAll(/\\"id\\":\\"([^\\"]+)\\"/g)].map((m) => m[1]));
  const ids = idsOf(html);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h.startsWith("/") || h.startsWith("#"));
  for (const href of hrefs) {
    const [path, anchor] = href.split("#");
    const target = path === "" ? page : path;
    if (anchor && target === page && !ids.has(anchor)) { console.log(`ANCHOR ${page}: #${anchor} not found on page`); broken++; continue; }
    if (!path || path === page) continue;
    if (!seen.has(path)) {
      const r = await fetch(`${base}${path}`, { method: "GET" });
      seen.set(path, { status: r.status, html: r.ok ? await r.text() : "" });
    }
    const t = seen.get(path);
    if (t.status >= 400) { console.log(`LINK ${page} -> ${href} : ${t.status}`); broken++; continue; }
    if (anchor && t.html && !idsOf(t.html).has(anchor)) { console.log(`ANCHOR ${page} -> ${href} : #${anchor} not found`); broken++; }
  }
}
console.log(`audited ${pages.length} pages, ${seen.size} distinct internal links, ${broken} problems`);
process.exit(broken ? 1 : 0);
