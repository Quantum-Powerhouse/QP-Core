import "katex/dist/katex.min.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
