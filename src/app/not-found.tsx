import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-24">
        <p className="font-mono text-sm text-accent">404 · state not found</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">This page tunneled away.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          QPet checked: the amplitude here is exactly zero. Either the address changed, or it never existed in this
          universe. Both happen.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-[#faf8f3]">
            measure → home
          </Link>
          <Link href="/playground/arcade" className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-foreground hover:border-accent/60">
            the arcade
          </Link>
          <Link href="/learn" className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-foreground hover:border-accent/60">
            learn
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
