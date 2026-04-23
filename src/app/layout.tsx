import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevLink | Code & Connect",
  description: "An Omegle-style educational platform for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <video autoPlay loop muted playsInline className="video-bg">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative z-0">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
