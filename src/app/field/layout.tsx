import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const FIELD_NAV: { href: string; label: string }[] = [
  { href: "/field", label: "Overview" },
  { href: "/field/hardware", label: "Hardware scoreboard" },
  { href: "/field/pqc", label: "Post quantum cryptography" },
  { href: "/field/first-solved", label: "What gets solved first" },
  { href: "/field/timeline", label: "The timeline debate" },
  { href: "/field/careers", label: "Careers" },
  { href: "/field/networking", label: "Quantum networking" },
  { href: "/field/sensing", label: "Quantum sensing" },
  { href: "/field/strategies", label: "National strategies" },
  { href: "/field/tooling", label: "Open source tooling" },
  { href: "/field/open-problems", label: "Open problems" },
  { href: "/applications", label: "Applications map" },
];

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 lg:flex-row">
          <nav className="glass-panel rounded-xl p-4 lg:sticky lg:top-24 lg:h-fit lg:w-56 lg:shrink-0">
            <Link href="/field" className="font-mono text-sm text-accent">
              The field
            </Link>
            <ul className="mt-4 flex flex-col gap-1.5">
              {FIELD_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="min-w-0 flex-1">{children}</article>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
