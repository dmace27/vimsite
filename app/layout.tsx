import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-editor",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Daniel Mace — Developer", template: "%s — Daniel Mace" },
  description: "A keyboard-first portfolio about thoughtful software, systems, and the craft behind them.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrains.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
