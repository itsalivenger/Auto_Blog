import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto Blog Website",
  description: "A website that automatically generates and publishes blog posts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <link rel="icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="description" content="A website that automatically generates and publishes blog posts." />
      <meta name="keywords" content="blog, automation, AI, publishing" />
      <meta name="author" content="Ali Houssa" />
      <meta name="robots" content="index, follow" />
      <meta name="google-site-verification" content="your-google-site-verification-code" />
      <meta property="og:title" content="Auto Blog Website" />
      <meta property="og:description" content="A website that automatically generates and publishes blog posts." />
      <meta property="og:image" content="/og-image.png" />
      <meta property="og:url" content="https://cremcreations.com" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Auto Blog Website" />
      <meta name="twitter:description" content="A website that automatically generates and publishes blog posts." />
      <meta name="twitter:image" content="/og-image.png" />
      <meta name="twitter:site" content="@Itsalivenger" />
      <meta name="twitter:creator" content="@Itsalivenger" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link href={geistSans.variable} rel="stylesheet" />
      <link href={geistMono.variable} rel="stylesheet" />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
