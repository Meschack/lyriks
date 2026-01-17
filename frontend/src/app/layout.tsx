import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'
import { sfPro } from '@/fonts'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

const SITE_NAME = 'Lyriks'
const SITE_DESCRIPTION = 'Create and share beautiful lyrics cards for free'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lyriks-pied.vercel.app'

export const metadata: Metadata = {
  // Base metadata
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Create your lyrics cards`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'lyrics',
    'quotes',
    'card',
    'music',
    'song',
    'share',
    'generator',
    'image',
    'custom',
    'aesthetic',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // OpenGraph - Place your opengraph-image.png in src/app/
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: 'Your lyrics. Your style. Your image.',
    // Image will be auto-detected from src/app/opengraph-image.png
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Your lyrics. Your style. Your image.',
    // Image will be auto-detected from src/app/twitter-image.png
  },

  // Icons - Place your icons in src/app/
  // favicon.ico, icon.png, apple-icon.png
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },

  // App manifest for PWA
  manifest: '/manifest.json',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add your IDs when ready)
  // verification: {
  //   google: 'your-google-verification-id',
  // },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className={cn('dark', sfPro.variable)}>
      <body className={cn('font-sans antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
