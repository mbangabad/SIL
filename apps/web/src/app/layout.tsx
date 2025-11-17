import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PageViewTracker } from '../components/PageViewTracker'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Semantic Intelligence League - Cognitive Assessment Through Play',
  description: '50 micro-games testing semantic intelligence, pattern recognition, and strategic reasoning. Discover your cognitive strengths with science-inspired brainprint profiling.',
  keywords: ['cognitive games', 'brain training', 'semantic intelligence', 'pattern recognition', 'IQ games', 'mental fitness'],
  authors: [{ name: 'SIL Team' }],
  openGraph: {
    title: 'Semantic Intelligence League',
    description: '50 cognitive micro-games. Discover your brainprint.',
    url: 'https://sil.app',
    siteName: 'Semantic Intelligence League',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Semantic Intelligence League - Cognitive Assessment Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Semantic Intelligence League',
    description: '50 cognitive micro-games. Discover your brainprint.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-body bg-background text-white`}>
        <PageViewTracker />
        {children}
      </body>
    </html>
  )
}
