import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "NPC Town - AI Social Experiment",
  description: "Watch AI NPCs live their lives in a terminal-style town",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistMono.className}>
      <body className="min-h-screen bg-black text-amber-600 antialiased">
        {children}
      </body>
    </html>
  );
}