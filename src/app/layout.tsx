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
  title: "Hosico Bounties Platform",
  description: "A platform to manage and participate in Hosico community bounties.",
  generator: "Next.js",
  keywords: ["solana", "bounties", "hosico"],
  icons: [
    { rel: "apple-touch-icon", url: "/images/hosico-portrait.png" },
    { rel: "icon", url: "/images/hosico-portrait.png" },
  ],
  twitter: {
    card: "summary_large_image",
    site: "@Hosico_on_sol",
    creator: "@Hosico_on_sol",
    title: "Hosico Bounties",
    description: "Earn HOSICO Tokens by Contributing to Our Community",
    images: {
      url: "/images/hosico-thumbail.png",
      alt: "Hosico Bounties",
      username: "@Hosico_on_sol",
      width: 1920,
      height: 1080,
      type: "image/png",
    },
  },
  openGraph: {
    title: "Hosico Bounties",
    description: "Earn HOSICO Tokens by Contributing to Our Community",
    url: "bounties.hosico.cat",
    type: "website",
    locale: "en",
    siteName: "Hosico Bounties",
    images: {
      url: "/images/hosico-thumbail.png",
      alt: "Hosico Bounties",
      width: 1920,
      height: 1080,
      type: "image/png",
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
