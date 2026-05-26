import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import { I18nHtmlSync } from "@/components/providers/I18nHtmlSync";
import { I18nHydrator } from "@/components/providers/I18nHydrator";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://secondmemory.app";

export const metadata: Metadata = {
  title: {
    default: "Second Memory — Your second brain for conversations",
    template: "%s · Second Memory",
  },
  description:
    "Second Memory remembers every conversation for you. AI meeting intelligence, workspace memory, and instant recall across your team.",
  keywords: [
    "AI memory",
    "meeting intelligence",
    "conversation memory",
    "workspace AI",
    "meeting notes",
    "semantic search",
  ],
  authors: [{ name: "Second Memory" }],
  creator: "Second Memory",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ru_RU"],
    url: siteUrl,
    siteName: "Second Memory",
    title: "Second Memory — Your second brain for conversations",
    description:
      "Remember every meeting. AI summaries, memory timelines, and workspace-wide recall.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Second Memory — Your second brain for conversations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Second Memory — Your second brain for conversations",
    description:
      "Remember every meeting. AI summaries, memory timelines, and workspace-wide recall.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Second Memory",
  },
};

export const viewport = {
  themeColor: "#08080d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#08080d] cursor-glow">
      <link rel="manifest" href="/site.webmanifest" />
        {children}
        <ToastProvider />
        <I18nHydrator />
        <I18nHtmlSync />
      </body>
    </html>
  );
}
