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

export const metadata: Metadata = {
  title: "Japan Solo Dining",
  description: "A comprehensive guide for solo dining in Japan. because we have no friends to travel with.",
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
