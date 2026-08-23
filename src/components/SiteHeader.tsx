import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Quantum Powerhouse
        </Link>
        <nav className="hidden gap-7 text-sm text-muted sm:flex">
          <Link href="/playground/arcade" className="text-accent transition-colors hover:text-foreground">
            Arcade
          </Link>
          <Link href="/learn" className="transition-colors hover:text-foreground">
            Learn
          </Link>
          <Link href="/field" className="transition-colors hover:text-foreground">
            Field
          </Link>
          <Link href="/research" className="transition-colors hover:text-foreground">
            Research
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/#about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/builder" className="transition-colors hover:text-foreground">
            Builder
          </Link>
        </nav>
      </div>
    </header>
  );
}
