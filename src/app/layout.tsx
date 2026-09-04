import type { Metadata } from "next";
import { Geist, JetBrains_Mono, STIX_Two_Text } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { AmbientFx } from "@/components/three/AmbientFx";
import { QuantumEventProvider } from "@/components/quantum/QuantumEventProvider";
import { ZoomNav } from "@/components/nav/ZoomNav";
import { personSchema, websiteSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const stixSerif = STIX_Two_Text({
  variable: "--font-stix",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({ title: "Quantum Powerhouse", path: "/" }),
  title: {
    default: "Quantum Powerhouse",
    template: "%s · Quantum Powerhouse",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${stixSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <QuantumEventProvider>
          <AmbientFx />
          <ZoomNav><div id="main-content" className="contents">{children}</div></ZoomNav>
        </QuantumEventProvider>
        <JsonLd data={personSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
