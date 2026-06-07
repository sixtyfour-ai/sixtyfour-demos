import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://demos.sixtyfour.ai",
  ),
  title: {
    default: "Sixtyfour Demos",
    template: "%s · Sixtyfour Demos",
  },
  description:
    "Open-source demos for the Sixtyfour API. Clone, run, fork, ship — every demo is a working starting point for an AI-powered intelligence app.",
  openGraph: {
    title: "Sixtyfour Demos",
    description:
      "Open-source demos for the Sixtyfour API. Clone, run, fork, ship.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sixtyfour Demos",
    description:
      "Open-source demos for the Sixtyfour API. Clone, run, fork, ship.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
