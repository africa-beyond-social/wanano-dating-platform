import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WANANO — Meaningful Connections. Lasting Love.",
  description: "A relationship and marriage matchmaking platform built around verified people, thoughtful compatibility and meaningful connections.",
  applicationName: "WANANO",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
