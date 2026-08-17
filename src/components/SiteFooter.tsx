export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} Quantum Powerhouse.</p>
        <a
          href="https://github.com/Quantum-Powerhouse/QP-Core"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent"
        >
          GitHub — Quantum-Powerhouse/QP-Core
        </a>
      </div>
    </footer>
  );
}
