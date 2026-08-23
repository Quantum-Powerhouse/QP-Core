/** The site map, shared by the desktop nav and the phone menu. Plain data, no "use client". */
export const NAV_ITEMS: { href: string; label: string; accent?: boolean }[] = [
  { href: "/playground/arcade", label: "Arcade", accent: true },
  { href: "/lab", label: "Lab" },
  { href: "/hardware", label: "Hardware" },
  { href: "/learn", label: "Learn" },
  { href: "/field", label: "Field" },
  { href: "/research", label: "Research" },
  { href: "/docs", label: "Docs" },
  { href: "/builder", label: "Builder" },
];
