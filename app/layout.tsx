import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { PWARegister } from "@/components/PWARegister";
import { Analytics } from "@/components/analytics";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Remedi - Natural Alternatives to Pharmaceuticals",
    template: "%s | Remedi",
  },
  description: "Discover evidence-based natural remedies and alternatives to pharmaceutical drugs and supplements. Find safe, effective herbal and nutritional options backed by scientific research.",
  keywords: [
    "natural remedies",
    "herbal medicine",
    "pharmaceutical alternatives",
    "natural supplements",
    "holistic health",
    "alternative medicine",
    "herbal supplements",
    "natural health",
    "wellness",
    "nutrition",
  ],
  authors: [{ name: "Remedi Team" }],
  creator: "Remedi",
  publisher: "Remedi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Remedi",
    title: "Remedi - Natural Alternatives to Pharmaceuticals",
    description: "Discover evidence-based natural remedies and alternatives to pharmaceutical drugs and supplements.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Remedi - Natural Alternatives to Pharmaceuticals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remedi - Natural Alternatives to Pharmaceuticals",
    description: "Discover evidence-based natural remedies and alternatives to pharmaceutical drugs and supplements.",
    images: ["/og-image.png"],
    creator: "@remedi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add when available
    // google: "your-google-site-verification",
    // yandex: "your-yandex-verification",
    // bing: "your-bing-verification",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Remedi",
  },
  applicationName: "Remedi",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* WebSite Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen bg-white dark:bg-zinc-900 text-black dark:text-white`}
      >
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <Providers>
          <main id="main-content">
            {children}
          </main>
          <PWARegister />
        </Providers>
        <Analytics
          plausibleDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
        />
      </body>
    </html>
  );
}
