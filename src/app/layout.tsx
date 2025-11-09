import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { AppProviders } from "@/components/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SSX Bounties Platform",
  description: "A platform to manage and participate in SSX community bounties.",
  generator: "Next.js",
  keywords: ["solana", "bounties", "ssx"],
  icons: [
    { rel: "apple-touch-icon", url: "/images/ssx-logo.jpg" },
    { rel: "icon", url: "/images/ssx-logo.jpg" },
  ],
  twitter: {
    card: "summary_large_image",
    site: "@ssxcapital",
    creator: "@ssxcapital",
    title: "SSX Bounties",
    description: "Earn $SSX Tokens by Contributing to Our Community",
    images: {
      url: "/images/ssx-banner.jpg",
      alt: "SSX Bounties",
      username: "@ssxcapital",
      width: 1920,
      height: 1080,
      type: "image/jpg",
    },
  },
  openGraph: {
    title: "SSX Bounties",
    description: "Earn $SSX Tokens by Contributing to Our Community",
    url: "bounties.ssxcapital.com",
    type: "website",
    locale: "en",
    siteName: "SSX Bounties",
    images: {
      url: "/images/ssx-banner.jpg",
      alt: "SSX Bounties",
      width: 1920,
      height: 1080,
      type: "image/jpg",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <Header />
        {children}
        </AppProviders>
      </body>
    </html>
  );
}
