export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Quantum Powerhouse
        </a>
        <nav className="hidden gap-8 text-sm text-muted sm:flex">
          <a href="#about" className="transition-colors hover:text-foreground">
            About
          </a>
          <a href="#transpiler" className="transition-colors hover:text-foreground">
            Transpiler
          </a>
          <a href="#projects" className="transition-colors hover:text-foreground">
            Projects
          </a>
        </nav>
      </div>
    </header>
  );
}
