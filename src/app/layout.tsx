import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// Served from this site (the geist package) instead of fetched from Google Fonts at build time,
// so a build never depends on Google being reachable. Same font, same --font-geist-sans variable.
const geist = GeistSans;

export const metadata: Metadata = {
  title: "Boulos Chaaya — Full-Stack Developer",
  description: "Full-stack developer based in Beirut, Lebanon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}