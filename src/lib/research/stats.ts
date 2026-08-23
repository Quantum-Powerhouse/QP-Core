import { CLAIMS, type ClaimStatus } from "./claims";
import { EVIDENCE } from "./evidence";
import { PRIOR_ART } from "./priorArt";

export type ResearchStats = {
  totalClaims: number;
  claimsByStatus: Record<ClaimStatus, number>;
  confirmedOrPartial: number;
  priorArtSystems: number;
  evidenceRecords: number;
  uniqueSourcesLinked: number;
};

/**
 * Every number here is derived from the same CLAIMS / EVIDENCE / PRIOR_ART arrays
 * the claims/evidence/prior-art pages render, nothing is hand-typed separately,
 * so the stats can't drift out of sync with the underlying research data.
 */
export function getResearchStats(): ResearchStats {
  const claimsByStatus: Record<ClaimStatus, number> = {
    confirmed: 0,
    partial: 0,
    unverified: 0,
    false: 0,
    not_found: 0,
  };

  for (const claim of CLAIMS) {
    claimsByStatus[claim.status] += 1;
  }

  const sourceUrls = new Set<string>();
  for (const row of PRIOR_ART) {
    if (row.sourceUrl) sourceUrls.add(row.sourceUrl);
  }
  for (const record of EVIDENCE) {
    if (record.sourceUrl) sourceUrls.add(record.sourceUrl);
  }

  return {
    totalClaims: CLAIMS.length,
    claimsByStatus,
    confirmedOrPartial: claimsByStatus.confirmed + claimsByStatus.partial,
    priorArtSystems: PRIOR_ART.length,
    evidenceRecords: EVIDENCE.length,
    uniqueSourcesLinked: sourceUrls.size,
  };
}
