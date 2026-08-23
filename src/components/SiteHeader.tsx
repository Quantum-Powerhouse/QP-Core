import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { NAV_ITEMS } from "@/components/navItems";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Quantum Powerhouse
        </Link>
        <nav aria-label="Primary" className="hidden gap-7 text-sm text-muted sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-foreground ${item.accent ? "text-accent" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
