import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import { EventOSProvider } from "@/components/competition/eventos-store";
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
      <body className="flex min-h-full flex-col">
        <AuthSessionProvider>
          <EventOSProvider>{children}</EventOSProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
