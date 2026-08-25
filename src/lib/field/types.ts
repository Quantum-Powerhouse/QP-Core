/**
 * "Field" content, the state of the quantum industry, written to the same
 * standard as the research section: every entry names a source a reader can
 * open, and carries a status that says what kind of claim it is.
 *
 * Validated by tests/field.test.mjs (source URLs, statuses, dates, no hype).
 */

export type FieldStatus =
  /** a published, peer-reviewed or officially documented result */
  | "verified"
  /** a vendor-published result not (yet) independently peer-reviewed */
  | "vendor-reported"
  /** a roadmap target or forecast, a promise, not a result */
  | "projection"
  /** a named person's stated view, an opinion, dated */
  | "opinion"
  /** a resource estimate or aggregator statistic with stated caveats */
  | "estimate"
  /** publicly disputed in the peer-reviewed record */
  | "contested"
  /** a preprint not yet peer-reviewed at the check date */
  | "preprint";

export type FieldSource = { label: string; url: string };

export type FieldClaim = {
  id: string;
  title: string;
  body: string;
  status: FieldStatus;
  /** YYYY-MM of the underlying document or statement */
  date: string;
  source: FieldSource;
  /** optional second source (e.g. the rebuttal, or the peer-reviewed version) */
  also?: FieldSource;
};

export const FIELD_STATUS_LABEL: Record<FieldStatus, string> = {
  verified: "Verified, published result",
  "vendor-reported": "Vendor reported result",
  projection: "Projection, roadmap target",
  opinion: "Opinion, named, dated",
  estimate: "Estimate, with caveats",
  contested: "Contested, disputed in the record",
  preprint: "Preprint, not yet peer reviewed",
};

export const FIELD_CHECKED_ON = "2026-08-21";
