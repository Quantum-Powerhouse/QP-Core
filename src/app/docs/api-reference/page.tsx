import type { Metadata } from "next";
import { ApiReferenceClient } from "@/components/docs/ApiReferenceClient";
import { Cite, DocTitle, Note, P, SourceLink } from "@/components/docs/DocElements";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "API Reference",
  description:
    "Interactive OpenAPI reference for the QP-Core transpiler backend (quantumflow-api): request/response schemas for /transpile and /health.",
  path: "/docs/api-reference",
  keywords: ["OpenAPI reference", "FastAPI OpenQASM transpiler API", "Amazon Braket API"],
});

export default function ApiReferenceDocPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_TRANSPILER_API_URL;
  const isLive = Boolean(apiBaseUrl);
  const specUrl = isLive ? `${apiBaseUrl!.replace(/\/$/, "")}/openapi.json` : "/openapi/quantumflow-api.json";

  return (
    <>
      <a href="/docs" className="mb-6 inline-block font-mono text-xs text-muted transition-colors hover:text-foreground">
        ← Docs
      </a>
      <DocTitle
        eyebrow="API"
        title="API Reference"
        dek="The real OpenAPI schema for QP-Core's FastAPI backend, 3 operations, generated directly from the service's Pydantic models, not hand-written."
      />

      {isLive ? (
        <Note>
          Live mode: fetched from <code>{specUrl}</code> at load time.
        </Note>
      ) : (
        <>
          <Note tone="warning">
            Snapshot mode: <code>NEXT_PUBLIC_TRANSPILER_API_URL</code> isn&apos;t set, so this is a static
            snapshot (<code>public/openapi/quantumflow-api.json</code>) rather than a live spec, the backend
            has no deployed URL configured for this build. Regenerate it from the real service with:
          </Note>
          <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-surface/60 p-3 font-mono text-xs text-muted">
            {`cd quantumflow-api && ./venv/Scripts/python.exe -c "from app.main import app; import json; print(json.dumps(app.openapi()))"`}
          </pre>
        </>
      )}
      <P>
        Source: <SourceLink href="https://github.com/sadeqisaidmohaddes-star/quantumflow-api">quantumflow-api</SourceLink>. See
        also <SourceLink href="/docs/qp-core/transpiler-pipeline">the transpiler pipeline doc</SourceLink> for
        what these endpoints actually do.
      </P>

      <ApiReferenceClient specUrl={specUrl} />

      <Cite>Source: quantumflow-api/app/models/schemas.py, app/api/routes.py</Cite>
    </>
  );
}
