import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
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
      className={`${geistSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QuantumEventProvider>
          <ParticleField />
          {children}
          <QuantumPet />
        </QuantumEventProvider>
        <JsonLd data={personSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
