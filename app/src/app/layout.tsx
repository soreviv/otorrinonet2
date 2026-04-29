import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, IBM_Plex_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { SiteJsonLd } from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://otorrinonet.com"),
  title: {
    default: "Dr. Alejandro Viveros Domínguez | Otorrinolaringólogo CDMX",
    template: "%s | Dr. Alejandro Viveros Domínguez ORL",
  },
  description:
    "Otorrinolaringólogo y Cirujano de Cabeza y Cuello en Lindavista, CDMX. Consulta ORL, cirugía, audiología, rinitis alérgica e inmunoterapia. Cédula 6277305.",
  keywords: [
    "otorrinolaringólogo",
    "otorrinolaringología",
    "ORL",
    "cirugía cabeza y cuello",
    "Lindavista",
    "Ciudad de México",
    "CDMX",
    "Gustavo A. Madero",
    "oído nariz garganta",
    "audiología",
    "rinitis alérgica",
    "inmunoterapia",
    "vacunación adultos",
    "Dr. Viveros",
  ],
  authors: [{ name: "Dr. Alejandro Viveros Domínguez" }],
  creator: "Dr. Alejandro Viveros Domínguez",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://otorrinonet.com",
    siteName: "Dr. Alejandro Viveros Domínguez ORL",
    title: "Dr. Alejandro Viveros Domínguez | Otorrinolaringólogo CDMX",
    description:
      "Otorrinolaringólogo y Cirujano de Cabeza y Cuello en Lindavista, CDMX. Consulta ORL, cirugía, audiología, rinitis alérgica e inmunoterapia.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Alejandro Viveros Domínguez — Otorrinolaringólogo en Lindavista, Ciudad de México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Alejandro Viveros Domínguez | Otorrinolaringólogo CDMX",
    description:
      "Otorrinolaringólogo y Cirujano de Cabeza y Cuello en Lindavista, CDMX.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", rel: "icon" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", rel: "icon" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html
      lang="es"
      className={`${inter.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        {children}
        <CookieBanner />
        <SiteJsonLd nonce={nonce} />
      </body>
    </html>
  );
}
