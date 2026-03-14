import "./globals.css";

import { DM_Sans, Sora } from "next/font/google";

import { AuthContextProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ApnaDost — Your Personal Companion",
  description:
    "Manage your tasks, passwords, files, expenses and more — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        // disableTransitionOnChange
      >
        <AuthContextProvider>
          <Navbar />
          <body className="antialiased">{children}</body>
        </AuthContextProvider>
      </ThemeProvider>
    </html>
  );
}
