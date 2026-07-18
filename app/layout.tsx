import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import GlobalSiteShell from "@/components/layout/GlobalSiteShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DarkLight Events",
  description: "FiveM RP event management og EventOS control center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black">
        <AuthSessionProvider>
          <GlobalSiteShell>{children}</GlobalSiteShell>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
