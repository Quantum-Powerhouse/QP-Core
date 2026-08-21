/**
 * Research artifact validator.
 *
 * The research record lives in two representations that must never drift apart:
 *   - research/evidence.json  — the structured, portable evidence record
 *   - src/lib/research/*.ts   — the typed data the website renders
 *
 * This script parses both, checks each for internal integrity, and then
 * cross-checks them against each other. It runs in CI on every push and PR.
 *
 * Run: npm run validate:research
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];
const warnings = [];

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

/** evidence.json uses SCREAMING_CASE; the site uses lowercase union members. */
const STATUS_MAP = {
  CONFIRMED: "confirmed",
  PARTIALLY_CONFIRMED: "partial",
  UNVERIFIED: "unverified",
  FALSE: "false",
  NOT_FOUND: "not_found",
};

const SITE_STATUSES = new Set(Object.values(STATUS_MAP));

/** Claims that are pure synthesis and legitimately have no primary-source record. */
const SYNTHESIS_CLAIMS = new Set(["C13"]);

const CLAIM_ID = /^C\d{2}$/;

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** A record's source_url may hold several URLs separated by "; ". */
function splitUrls(value) {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Claim strings are prefixed "C01: ..." or "C05/C06: ...". */
function parseClaimIds(claim, index) {
  const prefix = claim.split(":")[0]?.trim() ?? "";
  const ids = prefix.split("/").map((id) => id.trim());

  if (!ids.length || !ids.every((id) => CLAIM_ID.test(id))) {
    fail(`evidence.json[${index}]: claim must start with a claim ID prefix (e.g. "C01: ..."), got "${prefix}"`);
    return [];
  }
  return ids;
}

// ---------------------------------------------------------------------------
// 1. research/evidence.json — structural integrity
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS = [
  "claim",
  "status",
  "evidence",
  "source_url",
  "source_type",
  "source_title",
  "date_checked",
  "notes",
];

let evidenceJson;
try {
  evidenceJson = JSON.parse(readFileSync(resolve(ROOT, "research/evidence.json"), "utf8"));
} catch (error) {
  console.error(`FATAL: could not read/parse research/evidence.json — ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(evidenceJson) || evidenceJson.length === 0) {
  console.error("FATAL: research/evidence.json must be a non-empty array");
  process.exit(1);
}

const jsonClaimIds = new Set();
const jsonStatusById = new Map();
const today = new Date().toISOString().slice(0, 10);

evidenceJson.forEach((record, index) => {
  for (const field of REQUIRED_FIELDS) {
    const value = record[field];
    if (typeof value !== "string" || value.trim() === "") {
      fail(`evidence.json[${index}]: field "${field}" must be a non-empty string`);
    }
  }

  if (!Object.hasOwn(STATUS_MAP, record.status)) {
    fail(
      `evidence.json[${index}]: status "${record.status}" is not one of ${Object.keys(STATUS_MAP).join(", ")}`,
    );
  }

  if (typeof record.date_checked === "string") {
    if (!/^\d{4}-\d{2}-\d{2}/.test(record.date_checked)) {
      fail(`evidence.json[${index}]: date_checked "${record.date_checked}" must start with YYYY-MM-DD`);
    } else if (record.date_checked.slice(0, 10) > today) {
      fail(`evidence.json[${index}]: date_checked "${record.date_checked}" is in the future`);
    }
  }

  if (typeof record.source_url === "string") {
    const urls = splitUrls(record.source_url);
    if (urls.length === 0) {
      fail(`evidence.json[${index}]: source_url contains no URLs`);
    }
    // An absence result has no page to link to — its "source" is the search that
    // came back empty. Those may describe the method in prose instead of a URL;
    // every other status must cite something a reader can actually open.
    const absenceResult = record.status === "NOT_FOUND";
    for (const url of urls) {
      if (isHttpUrl(url)) continue;
      if (absenceResult) {
        warn(`evidence.json[${index}] (NOT_FOUND): source is a described search, not a link — "${url}"`);
      } else {
        fail(`evidence.json[${index}]: "${url}" is not a valid http(s) URL`);
      }
    }
  }

  if (typeof record.claim === "string") {
    for (const id of parseClaimIds(record.claim, index)) {
      if (jsonClaimIds.has(id)) fail(`evidence.json: duplicate claim ID ${id}`);
      jsonClaimIds.add(id);
      jsonStatusById.set(id, STATUS_MAP[record.status]);
    }
  }
});

// ---------------------------------------------------------------------------
// 2. Site data — structural integrity
// ---------------------------------------------------------------------------

const { CLAIMS } = await import("../src/lib/research/claims.ts");
const { EVIDENCE } = await import("../src/lib/research/evidence.ts");
const { PRIOR_ART } = await import("../src/lib/research/priorArt.ts");
const { SOURCE_GROUPS } = await import("../src/lib/research/sources.ts");

const siteClaimIds = new Set();

for (const claim of CLAIMS) {
  if (!CLAIM_ID.test(claim.id)) fail(`claims.ts: "${claim.id}" is not a valid claim ID`);
  if (siteClaimIds.has(claim.id)) fail(`claims.ts: duplicate claim ID ${claim.id}`);
  siteClaimIds.add(claim.id);

  if (!SITE_STATUSES.has(claim.status)) {
    fail(`claims.ts ${claim.id}: status "${claim.status}" is not a valid ClaimStatus`);
  }
  for (const field of ["claim", "evidence", "confidence"]) {
    if (typeof claim[field] !== "string" || claim[field].trim() === "") {
      fail(`claims.ts ${claim.id}: "${field}" must be a non-empty string`);
    }
  }
  // Anything we assert a status about must say where that status came from.
  if (claim.status !== "unverified" && (!claim.source || claim.source.trim() === "")) {
    fail(`claims.ts ${claim.id}: status "${claim.status}" requires a source`);
  }
}

for (const [index, record] of EVIDENCE.entries()) {
  if (!Array.isArray(record.claimIds) || record.claimIds.length === 0) {
    fail(`evidence.ts[${index}]: claimIds must be a non-empty array`);
    continue;
  }
  for (const id of record.claimIds) {
    if (!siteClaimIds.has(id)) fail(`evidence.ts[${index}]: claimIds references unknown claim ${id}`);
  }
  if (!SITE_STATUSES.has(record.status)) {
    fail(`evidence.ts[${index}]: status "${record.status}" is not a valid ClaimStatus`);
  }
  for (const field of ["claim", "evidence", "sourceUrl", "sourceType", "sourceTitle"]) {
    if (typeof record[field] !== "string" || record[field].trim() === "") {
      fail(`evidence.ts[${index}]: "${field}" must be a non-empty string`);
    }
  }
  if (typeof record.sourceUrl === "string" && !isHttpUrl(record.sourceUrl)) {
    fail(`evidence.ts[${index}]: sourceUrl "${record.sourceUrl}" is not a valid http(s) URL`);
  }
}

const priorArtNames = new Set();
for (const row of PRIOR_ART) {
  if (typeof row.name !== "string" || row.name.trim() === "") {
    fail("priorArt.ts: every row needs a name");
    continue;
  }
  if (priorArtNames.has(row.name)) fail(`priorArt.ts: duplicate system "${row.name}"`);
  priorArtNames.add(row.name);

  if (row.sourceUrl !== undefined && !isHttpUrl(row.sourceUrl)) {
    fail(`priorArt.ts "${row.name}": sourceUrl "${row.sourceUrl}" is not a valid http(s) URL`);
  }
  if (!row.sourceLabel || row.sourceLabel.trim() === "") {
    fail(`priorArt.ts "${row.name}": every system must cite where it was inspected`);
  }
}

const seenSourceUrls = new Map();
for (const group of SOURCE_GROUPS) {
  for (const item of group.items) {
    if (!item.label || item.label.trim() === "") fail(`sources.ts: item in "${group.heading}" has no label`);
    if (item.url === undefined) continue;
    if (!isHttpUrl(item.url)) fail(`sources.ts: "${item.url}" is not a valid http(s) URL`);
    // The same URL legitimately appears under different headings; flag only
    // exact repeats inside one group, which are always accidental.
    const key = `${group.heading}::${item.url}`;
    if (seenSourceUrls.has(key)) fail(`sources.ts: duplicate URL ${item.url} in "${group.heading}"`);
    seenSourceUrls.set(key, true);
  }
}

// ---------------------------------------------------------------------------
// 3. Cross-representation drift checks
// ---------------------------------------------------------------------------

for (const id of jsonClaimIds) {
  if (!siteClaimIds.has(id)) {
    fail(`drift: evidence.json documents ${id} but claims.ts has no such claim`);
  }
}

for (const id of siteClaimIds) {
  if (!jsonClaimIds.has(id) && !SYNTHESIS_CLAIMS.has(id)) {
    fail(`drift: claims.ts declares ${id} but research/evidence.json has no evidence record for it`);
  }
}

const siteEvidenceClaimIds = new Set(EVIDENCE.flatMap((record) => record.claimIds));
for (const id of jsonClaimIds) {
  if (!siteEvidenceClaimIds.has(id)) {
    fail(`drift: research/evidence.json covers ${id} but the rendered evidence page does not`);
  }
}
for (const id of siteEvidenceClaimIds) {
  if (!jsonClaimIds.has(id)) {
    fail(`drift: the evidence page renders ${id} with no backing record in research/evidence.json`);
  }
}

const siteStatusById = new Map(CLAIMS.map((claim) => [claim.id, claim.status]));
for (const [id, jsonStatus] of jsonStatusById) {
  const siteStatus = siteStatusById.get(id);
  if (siteStatus && siteStatus !== jsonStatus) {
    fail(`drift: ${id} is "${jsonStatus}" in research/evidence.json but "${siteStatus}" in claims.ts`);
  }
}

for (const record of EVIDENCE) {
  for (const id of record.claimIds) {
    const claimStatus = siteStatusById.get(id);
    if (claimStatus && claimStatus !== record.status) {
      warn(`${id}: claims.ts says "${claimStatus}", its evidence card says "${record.status}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

for (const message of warnings) console.warn(`  warn  ${message}`);
for (const message of errors) console.error(`  error ${message}`);

if (errors.length > 0) {
  console.error(`\nResearch validation FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(
  `Research validation passed: ${CLAIMS.length} claims, ${EVIDENCE.length} evidence cards, ` +
    `${evidenceJson.length} source records, ${PRIOR_ART.length} prior-art systems` +
    (warnings.length ? `, ${warnings.length} warning(s).` : "."),
);
