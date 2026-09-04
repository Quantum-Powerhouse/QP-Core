export function RepresentsTag({
  children,
  docsHref,
}: {
  children: React.ReactNode;
  docsHref?: string;
}) {
  return (
    <p className="mb-2 flex items-center gap-1.5 font-mono text-xs text-muted">
      <span className="text-accent">Represents:</span> {children}
      {docsHref && (
        <a href={docsHref} className="shrink-0 whitespace-nowrap text-accent transition-colors hover:text-foreground">
          → docs
        </a>
      )}
    </p>
  );
}
