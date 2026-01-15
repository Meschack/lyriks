import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'
import { sfPro } from '@/fonts'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Lyriks - Crée tes cartes de lyrics',
  description: 'Crée et partage de belles cartes de lyrics gratuitement',
  openGraph: {
    title: 'Lyriks',
    description: 'Tes lyrics. Ton style. Ton image.',
    type: 'website',
  },
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='fr' className={cn('dark', sfPro.variable)}>
      <body className={cn('font-sans antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
