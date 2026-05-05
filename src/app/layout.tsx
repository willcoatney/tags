import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TAGS — The Apartment Guys System',
  description: 'Multifamily property repair marketplace',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
