"use client";

import { useEffect, useState } from "react";

type Pulse = { repo: string; lastCommit: string | null; commits30d: number | null; error?: string };

const REPOS = ["Quantum-Powerhouse/QP-Core", "sadeqisaidmohaddes-star/pytest-qequiv", "sadeqisaidmohaddes-star/quantum-cicd-research"];

function daysAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  return `${Math.floor(d)} days ago`;
}

/**
 * Live repository activity from the public GitHub API, proof the work is
 * ongoing, fetched at view time rather than typed in.
 */
export function RepoPulse() {
  const [pulses, setPulses] = useState<Pulse[] | null>(null);

  useEffect(() => {
    let alive = true;
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    Promise.all(
      REPOS.map(async (repo): Promise<Pulse> => {
        try {
          const r = await fetch(`https://api.github.com/repos/${repo}/commits?since=${since}&per_page=100`, { headers: { accept: "application/vnd.github+json" } });
          if (!r.ok) return { repo, lastCommit: null, commits30d: null, error: `HTTP ${r.status}` };
          const commits = (await r.json()) as { commit: { author: { date: string } } }[];
          return { repo, lastCommit: commits[0]?.commit.author.date ?? null, commits30d: commits.length };
        } catch (e) {
          return { repo, lastCommit: null, commits30d: null, error: e instanceof Error ? e.message : "fetch failed" };
        }
      }),
    ).then((p) => {
      if (alive) setPulses(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="glass-panel rounded-xl p-5">
      <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Repository activity: live from GitHub</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {(pulses ?? REPOS.map((repo): Pulse => ({ repo, lastCommit: null, commits30d: null }))).map((p) => (
          <li key={p.repo} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <a href={`https://github.com/${p.repo}`} className="font-mono text-foreground hover:text-accent" target="_blank" rel="noopener noreferrer">
              {p.repo}
            </a>
            <span className="font-mono text-xs text-muted">
              {pulses === null ? "loading…" : p.error ? `unavailable (${p.error})` : `${p.commits30d} commits in 30 days · last ${p.lastCommit ? daysAgo(p.lastCommit) : "n/a"}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[11px] text-muted">Counts are capped at 100 per repository by the API page size.</p>
    </section>
  );
}
