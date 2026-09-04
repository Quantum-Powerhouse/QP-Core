import { NextRequest } from "next/server";

export const revalidate = 3600;

const ALLOWED = new Set([
  "Quantum-Powerhouse/QP-Core",
  "sadeqisaidmohaddes-star/pytest-qequiv",
  "sadeqisaidmohaddes-star/quantum-cicd-research",
]);

/** Cached GitHub activity proxy so every visitor shares one request instead
 *  of spending their own unauthenticated rate limit. */
export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  if (!ALLOWED.has(repo)) return Response.json({ error: "unknown repo" }, { status: 400 });
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/commits?since=${since}&per_page=100`, {
      headers: { accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) return Response.json({ error: `github ${r.status}` }, { status: 502 });
    const commits = (await r.json()) as { commit: { author: { date: string } } }[];
    return Response.json({
      repo,
      count: commits.length,
      lastCommit: commits[0]?.commit.author.date ?? null,
    });
  } catch {
    return Response.json({ error: "unreachable" }, { status: 502 });
  }
}
