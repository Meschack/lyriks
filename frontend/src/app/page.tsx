import { Suspense } from 'react'
import { LyricsWizard } from '@/components/wizard/lyrics-wizard'
import { Footer } from '@/components/shared/footer'
import { Skeleton } from '@/components/ui/skeleton'

function WizardSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-12 w-64 mx-auto' />
      <Skeleton className='h-[500px] w-full max-w-xl mx-auto' />
    </div>
  )
}

export default function HomePage() {
  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <header className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2'>Lyriks</h1>
          <p className='text-muted-foreground'>Your lyrics. Your style. Your image.</p>
        </header>

        {/* Wizard */}
        <Suspense fallback={<WizardSkeleton />}>
          <LyricsWizard />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}
