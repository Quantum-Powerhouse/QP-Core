import { ALGORITHMS } from "@/lib/field/algorithms";
import { CAREER_FACTS } from "@/lib/field/careers";
import { FIRST_SOLVED } from "@/lib/field/firstSolved";
import { HARDWARE_MILESTONES, HARDWARE_ROADMAPS } from "@/lib/field/hardware";
import { NETWORKING } from "@/lib/field/networking";
import { OPEN_PROBLEMS } from "@/lib/field/openProblems";
import { PQC_STANDARDS, PQC_THREAT, RSA_ESTIMATES } from "@/lib/field/pqc";
import { SENSING } from "@/lib/field/sensing";
import { STRATEGIES } from "@/lib/field/strategies";
import { TIMELINE_OPTIMISTS, TIMELINE_SKEPTICS } from "@/lib/field/timeline";
import { TOOLING } from "@/lib/field/tooling";
import { FIELD_CHECKED_ON } from "@/lib/field/types";

export const dynamic = "force-static";

/** Every field claim as data: id, status, date, body, and its source URL.
 *  The same typed records the pages render, nothing separate to drift. */
export function GET() {
  const sections = [
    { id: "hardware", claims: [...HARDWARE_MILESTONES, ...HARDWARE_ROADMAPS] },
    { id: "pqc", claims: [...PQC_STANDARDS, ...PQC_THREAT, ...RSA_ESTIMATES] },
    { id: "algorithms", claims: ALGORITHMS },
    { id: "careers", claims: CAREER_FACTS },
    { id: "timeline", claims: [...TIMELINE_OPTIMISTS, ...TIMELINE_SKEPTICS] },
    { id: "first-solved", claims: FIRST_SOLVED },
    { id: "networking", claims: NETWORKING },
    { id: "sensing", claims: SENSING },
    { id: "strategies", claims: STRATEGIES },
    { id: "tooling", claims: TOOLING },
    { id: "open-problems", claims: OPEN_PROBLEMS },
  ];
  return Response.json({
    schema: "quantum-powerhouse/field-claims@1",
    checkedOn: FIELD_CHECKED_ON,
    source: "https://quantum.sadeqi.me/field",
    sections: sections.map((s) => ({
      id: s.id,
      claims: s.claims.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        date: c.date,
        body: c.body,
        source: c.source,
        also: c.also ?? null,
      })),
    })),
  });
}
