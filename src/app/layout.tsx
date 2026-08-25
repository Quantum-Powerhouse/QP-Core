import type { Metadata } from "next";
import { Geist, JetBrains_Mono, STIX_Two_Text } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { BlackHole } from "@/components/three/BlackHole";
import { ParticleField } from "@/components/three/ParticleField";
import { QuantumEventProvider } from "@/components/quantum/QuantumEventProvider";
import { QuantumPet } from "@/components/quantum/pet/QuantumPet";
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
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${stixSerif.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QuantumEventProvider>
          <ParticleField />
          {/* The resident singularity: huge, translucent, behind everything. */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 opacity-40 [transform:translate(18%,-12%)_scale(1.75)] motion-reduce:opacity-25"
          >
            <BlackHole />
          </div>
          {children}
          <QuantumPet />
        </QuantumEventProvider>
        <JsonLd data={personSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
