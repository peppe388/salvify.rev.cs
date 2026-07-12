import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Salvify",
  description: "Gestione Risparmi Personale",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
