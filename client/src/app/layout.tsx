import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth"
import { ThemeProvider } from "@/lib/theme"
import { QueryProvider } from "@/lib/query"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toaster } from "sonner"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Salvify — Gestione Risparmi Personale",
  description: "Il modo più intelligente per gestire i tuoi risparmi, budget e obiettivi finanziari.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  style: { fontFamily: 'var(--font-sans)' },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
