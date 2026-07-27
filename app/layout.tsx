import type { Metadata, Viewport } from "next";
import { Playfair_Display, Mulish } from "next/font/google";
import { siteConfig } from "@/config/wedding";
import { getSiteContent } from "@/services/content.service";
import { formatDate, formatTime } from "@/lib/format";
import "./globals.css";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Mulish({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const coupleTitle = `${content.couple.brideFirstName} & ${content.couple.groomFirstName}`;
  const dateLabel = formatDate(content.event.dateTimeISO);
  const timeLabel = formatTime(content.event.dateTimeISO);

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${coupleTitle} — Nos casamos`,
    description: `Invitación de matrimonio de ${coupleTitle}. ${dateLabel} en ${content.venue.name}, ${content.event.country}.`,
    openGraph: {
      title: `${coupleTitle} — Nos casamos`,
      description: `${dateLabel} · ${timeLabel}`,
      images: [content.hero.imageSrc],
      locale: "es_CL",
      type: "website",
    },
    robots: {
      // La invitación no debe indexarse: es información privada de los novios.
      index: false,
      follow: false,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e0218a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
