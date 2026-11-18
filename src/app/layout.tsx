import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TAGS — The Apartment Guys System',
  icons: {
    apple: '/apple-touch-icon.png',
  },
  description: 'Describe the problem. Upload a photo. Get a professional Scope of Work in 60 seconds — then share it with any contractor you choose.',
  metadataBase: new URL('https://www.tagyourproject.com'),
  openGraph: {
    title: 'TAGS — Stop letting contractors write your scope.',
    description: 'Describe the problem. Upload a photo. Get a professional Scope of Work in 60 seconds — then share it with any contractor you choose.',
    url: 'https://www.tagyourproject.com',
    siteName: 'TAGS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Property manager photographing wall damage — TAGS turns photos into professional Scopes of Work',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAGS — Stop chasing contractors. Start managing repairs.',
    description: 'Describe the problem. Upload a photo. Get a professional Scope of Work in 60 seconds — share it with any contractor you choose.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Skip to main content — keyboard / screen reader navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus:text-white focus:bg-teal-600 focus:outline-none"
          >
            Skip to main content
          </a>
          <main id="main-content">
            {children}
          </main>
          <Toaster richColors position="top-right" />
          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
