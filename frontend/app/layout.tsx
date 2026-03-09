import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BitForge | Systems Interview Practice",
  description:
    "Firmware, embedded, networking, and low-level security interview practice with C-first problem workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
