import type { Metadata, Viewport } from "next";
import { Jost, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LogoWatermark } from "@/components/LogoWatermark";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BK Web Design — Professional Websites for Individuals & Companies",
  description:
    "BK Web Design builds clean, modern, responsive websites, landing pages and portfolios for individuals and companies.",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#EDE9E3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${jost.variable} ${ibmPlexArabic.variable}`}
    >
      <body>
        <LogoWatermark />
        <div className="site-content">{children}</div>
      </body>
    </html>
  );
}
