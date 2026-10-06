import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Therkildsen Entreprise | Uforpligtende vurdering",
  description:
    "Få en professionel og uforpligtende vurdering af dit byggeprojekt hos Therkildsen Entreprise.",
};

export const viewport: Viewport = {
  themeColor: "#151714",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
