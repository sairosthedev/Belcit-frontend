import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import QueryProvider from "@/components/QueryProvider";
import { TouchProvider } from "@/contexts/touch-context";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BELCIT TRADING",
  description:
    "Its more than a market....",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BELCIT TRADING",
  },
  icons: {
    icon: "/BT.png",
    apple: "/BT.png",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#2563eb",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            <TouchProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </TouchProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
