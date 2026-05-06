import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TAGS — The Apartment Guys System',
  description: 'Snap a photo. Describe the problem. Get a professional Scope of Work in seconds — then qualified contractors bid for the job. Free for property managers.',
  metadataBase: new URL('https://www.tagyourproject.com'),
  openGraph: {
    title: 'TAGS — Stop chasing contractors. Start managing repairs.',
    description: 'Snap a photo. Describe the problem. Get a professional Scope of Work in seconds — then qualified contractors bid for the job. Free for property managers.',
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
    description: 'Snap a photo. Describe the problem. Get a professional Scope of Work in seconds. Free for property managers.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
