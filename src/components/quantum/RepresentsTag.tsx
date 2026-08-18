export function RepresentsTag({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] text-muted">
      <span className="text-accent-2">Represents:</span> {children}
    </p>
  );
}
