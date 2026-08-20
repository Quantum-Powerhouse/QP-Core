import type { Metadata } from "next";
import { Cite, DocTitle, Note, P, SourceLink } from "@/components/docs/DocElements";
import { MatrixCell } from "@/components/research/StatusBadge";
import { PRIOR_ART } from "@/lib/research/priorArt";
import { researchFileUrl } from "@/lib/research/links";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Prior-Art Matrix",
  description: "21 quantum software testing, debugging, and CI/CD systems compared across regression testing, equivalence checking, pytest, GitHub Actions, cross-version and cross-SDK support.",
  path: "/research/prior-art",
});

type CellColumnKey =
  | "openSource"
  | "regressionTesting"
  | "equivalenceChecking"
  | "debuggingTracing"
  | "pytest"
  | "githubActions"
  | "cicd"
  | "crossVersion"
  | "crossSDK"
  | "bugCorpus"
  | "automatedFaultDetection"
  | "stateAwareAutonomous";

const COLUMNS: { key: CellColumnKey; label: string }[] = [
  { key: "openSource", label: "Open Source" },
  { key: "regressionTesting", label: "Regression Testing" },
  { key: "equivalenceChecking", label: "Equivalence Checking" },
  { key: "debuggingTracing", label: "Debugging / Tracing" },
  { key: "pytest", label: "pytest" },
  { key: "githubActions", label: "GitHub Actions" },
  { key: "cicd", label: "CI/CD" },
  { key: "crossVersion", label: "Cross-Version" },
  { key: "crossSDK", label: "Cross-SDK" },
  { key: "bugCorpus", label: "Bug Corpus" },
  { key: "automatedFaultDetection", label: "Auto Fault Detection" },
  { key: "stateAwareAutonomous", label: "State-Aware / Autonomous" },
];

export default function PriorArtPage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Prior Art"
        title="Prior-art comparison matrix"
        dek="21 systems — libraries, papers, benchmarks, CI templates, and pilots — compared across every dimension relevant to the proposed CI/CD regression-testing idea. Cells use YES / NO / PARTIAL / UNKNOWN only; nothing here was assumed."
      />

      <P>
        This is a condensed version (13 of the ~21 columns in the source table) chosen for on-screen
        readability. The complete matrix, including Academic?, Tracing, and Overlap notes for every system, is
        in <SourceLink href={researchFileUrl("research/prior_art.md")}>prior_art.md</SourceLink>.
      </P>

      <Note>
        Reading the matrix: no row is YES across pytest + Cross-Version + Cross-SDK + Auto Fault Detection
        simultaneously. <strong className="text-foreground">QUTest</strong> comes closest (YES on CI/CD,
        Cross-Version, Regression Testing) but is explicitly NO on pytest and Cross-SDK.{" "}
        <strong className="text-foreground">pytest-quantum</strong> is YES on pytest but only reaches
        framework-level equivalence, and is NO on Cross-Version.
      </Note>

      <div className="my-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[1400px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface/80 text-muted">
              <th className="sticky left-0 z-10 min-w-[240px] bg-surface/80 px-3 py-2.5 font-mono">System</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="min-w-[110px] px-3 py-2.5 font-mono font-normal">
                  {col.label}
                </th>
              ))}
              <th className="min-w-[260px] px-3 py-2.5 font-mono">Overlap with proposed work</th>
            </tr>
          </thead>
          <tbody>
            {PRIOR_ART.map((row) => (
              <tr key={row.name} className="border-b border-border/60 align-top">
                <td className="sticky left-0 z-10 bg-background px-3 py-3">
                  <p className="font-medium text-foreground">{row.name}</p>
                  <p className="font-mono text-[10px] text-muted/70">{row.type}</p>
                  {row.sourceUrl ? (
                    <a href={row.sourceUrl} className="font-mono text-[10px] text-accent hover:text-foreground">
                      {row.sourceLabel}
                    </a>
                  ) : (
                    <span className="font-mono text-[10px] text-muted">{row.sourceLabel}</span>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted">SDKs: {row.sdks}</p>
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-3 py-3">
                    <MatrixCell value={row[col.key]} />
                  </td>
                ))}
                <td className="px-3 py-3 text-muted">{row.overlap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Cite>Full 21-column matrix and per-system narrative: research/prior_art.md in the GitHub repository</Cite>
    </>
  );
}
