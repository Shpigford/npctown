import type { Metadata } from "next";
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
    <html lang="en">
      <body className="min-h-screen bg-black text-green-400 font-mono antialiased">
        {children}
      </body>
    </html>
  );
}