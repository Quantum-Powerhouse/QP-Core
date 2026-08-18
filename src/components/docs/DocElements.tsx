import { CodeBlock } from "@/components/CodeBlock";
import type { Lang } from "@/lib/highlight";

export function DocCode({ code, lang }: { code: string; lang: Lang }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-surface/60">
      <CodeBlock code={code} lang={lang} fit />
    </div>
  );
}

export function DocTitle({ eyebrow, title, dek }: { eyebrow: string; title: string; dek: string }) {
  return (
    <div className="mb-10">
      <p className="mb-2 font-mono text-sm text-accent">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{dek}</p>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 mb-4 text-2xl font-semibold tracking-tight text-foreground">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-muted">{children}</p>;
}

export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warning" }) {
  return (
    <div
      className={`my-6 rounded-lg border px-4 py-3 text-sm leading-relaxed ${
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/5 text-amber-200/90"
          : "border-accent/30 bg-accent/5 text-foreground/90"
      }`}
    >
      {children}
    </div>
  );
}

export function Cite({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 font-mono text-xs text-muted">{children}</p>;
}

export function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="font-mono text-xs text-accent transition-colors hover:text-foreground">
      {children}
    </a>
  );
}
