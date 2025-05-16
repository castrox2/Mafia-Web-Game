
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { useEffect } from "react";
import "./globals.css";
import SocketInitializer from "./socketinitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
// Both const geist initializes the two font variants
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// Sets page title and description for SEO standards
export const metadata: Metadata = {
  title: "Mafia Web Game",
  description: "Join or create rooms for an online Mafia party game",
};

export default function RootLayout({
  children,                            // Defines root component that wraps
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SocketInitializer>
          {children}
        </SocketInitializer>
      </body>
    </html>
  );
}