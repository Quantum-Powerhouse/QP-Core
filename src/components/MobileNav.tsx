"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "@/components/navItems";

/**
 * Phone navigation. Before this existed the header hid its links below the
 * `sm` breakpoint with nothing in their place — every phone visitor lost the
 * whole site map. This is a plain disclosure menu: a labelled button, a
 * panel that lists every section, closes on navigation and on Escape.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route actually changes (Link navigation keeps the header
  // mounted). Must not fire on mount: a mount-time close raced a fast tap on
  // slow devices and shut the menu the instant it opened.
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface/60 text-foreground transition-colors duration-150 ease-out active:scale-[0.97]"
      >
        <span aria-hidden className="relative block h-3.5 w-5">
          <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-200 ease-out ${open ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-opacity duration-150 ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 top-3 h-0.5 w-5 bg-current transition-transform duration-200 ease-out ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav-panel"
            aria-label="Site sections"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="glass-panel absolute inset-x-4 top-full mt-2 rounded-xl p-2"
          >
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-3 text-base transition-colors duration-150 ease-out hover:bg-surface/80 ${
                      item.accent ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
