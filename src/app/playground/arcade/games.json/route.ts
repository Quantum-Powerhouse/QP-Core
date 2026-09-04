import { ARCADE_GAME_COUNT, ARCADE_INDEX } from "@/components/arcade/manifest";

export const dynamic = "force-static";

const slugOf = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** The games registry as data. Every entry is a live, computed instrument. */
export function GET() {
  return Response.json({
    schema: "quantum-powerhouse/games@1",
    count: ARCADE_GAME_COUNT,
    source: "https://quantum.sadeqi.me/playground/arcade",
    sections: ARCADE_INDEX.map((g) => ({
      section: g.section,
      games: g.titles.map((title) => ({
        title,
        url: `https://quantum.sadeqi.me/playground/arcade#${slugOf(title)}`,
      })),
    })),
  });
}
