import { GLOSSARY } from "@/lib/glossary";

export const dynamic = "force-static";

/** The glossary as data, for course builders, aggregators and agents. */
export function GET() {
  return Response.json({
    schema: "quantum-powerhouse/glossary@1",
    source: "https://quantum.sadeqi.me/glossary",
    entries: GLOSSARY.map((e) => ({
      term: e.term,
      definition: e.def,
      computedAt: e.where ? `https://quantum.sadeqi.me${e.where.href}` : null,
    })),
  });
}
