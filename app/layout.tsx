import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google"; // Using Noto Sans Thai as primary
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import AOSInit from "@/components/AOSInit";

const notoSansThai = Noto_Sans_Thai({
  weight: ['300', '400', '500', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-project.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Japan Solo Dining",
  description: "A comprehensive guide for solo dining in Japan. because we have no friends to travel with.",
  keywords: ["Japan", "Solo Dining", "Osaka", "Kyoto", "Yakiniku", "Sushi", "Travel"],
  openGraph: {
    title: "Japan Solo Dining",
    description: "A comprehensive guide for solo dining in Japan. because we have no friends to travel with.",
    url: baseUrl,
    siteName: "Japan Solo Dining",
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Japan Solo Dining Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Japan Solo Dining",
    description: "A comprehensive guide for solo dining in Japan. because we have no friends to travel with.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is required for next-themes
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${notoSansThai.className} antialiased min-h-screen`}
      >
        <AOSInit />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
