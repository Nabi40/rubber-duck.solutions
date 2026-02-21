import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteData } from "@/components/Seo";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: siteData.title,
  creator: siteData.creator,
  description: siteData.description,
  keywords: siteData.keywords.join(", "),
  applicationName: "Rubber Duck Solutions",
  category: "Photo Editing",
  metadataBase: new URL(siteData.url),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteData.url,
  },
  openGraph: {
    title: siteData.title,
    description: siteData.description,
    url: siteData.url,
    siteName: siteData.title,
    images: [{ url: siteData.image, width: 1200, height: 630, alt: siteData.title }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteData.title,
    description: siteData.description,
    images: siteData.image,
    site: siteData.url,
    creator: siteData.creator,
  },
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "120x120",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "512x512",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicons/favicon.ico",
    },
  ],
};














export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <GoogleAnalytics gaId="G-PLCYD52C3E" />
      </body>
    </html>
  );
}
