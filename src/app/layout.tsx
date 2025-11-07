import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MobBitWallet - Be Your Own Bank",
  description: "Secure. Private. Borderless. A comprehensive cryptocurrency wallet with self-custody features for Bitcoin, Lightning Network, and more.",
  keywords: ["cryptocurrency", "wallet", "bitcoin", "lightning", "self-custody", "defi", "blockchain", "mobbitwallet"],
  authors: [{ name: "MobBitWallet Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "MobBitWallet - Be Your Own Bank",
    description: "Secure cryptocurrency wallet with self-custody features, Lightning Network support, and multi-wallet management.",
    url: "https://mobbitwallet.com",
    siteName: "MobBitWallet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MobBitWallet - Be Your Own Bank",
    description: "Secure cryptocurrency wallet with self-custody features and Lightning Network support.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
