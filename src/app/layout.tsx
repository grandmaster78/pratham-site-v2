import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Pratham Sarin | GM, Identity & Access Management @ Amazon Advertising",
  description:
    "General Manager owning product, engineering, and program for Advertising IAM. From founding team engineer to Amazon GM—bridging founder grit with global scale.",
  keywords: [
    "Pratham Sarin",
    "Amazon Advertising",
    "Identity Access Management",
    "General Manager",
    "Product Management",
    "Cornell Johnson MBA",
    "HealthKart",
  ],
  authors: [{ name: "Pratham Sarin", url: "https://prathamsarin.com" }],
  creator: "Pratham Sarin",
  openGraph: {
    type: "website",
    url: "https://prathamsarin.com",
    title: "Pratham Sarin | GM, IAM @ Amazon Advertising",
    description:
      "General Manager owning product, engineering, and program for Advertising IAM. From founding team engineer to Amazon GM.",
    siteName: "Pratham Sarin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pratham Sarin | GM, IAM @ Amazon Advertising",
    description: "Product & engineering leadership for Advertising Identity & Access Management.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
