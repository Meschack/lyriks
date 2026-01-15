'use client'

import { useCardParams, type WizardStep } from '@/hooks/use-card-params'
import { SearchSection } from '@/components/search/search-section'
import { LyricsSection } from '@/components/lyrics/lyrics-section'
import { CardPreviewSection } from '@/components/card-preview/card-preview-section'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Search, FileText, Sparkles } from 'lucide-react'

const STEPS = [
  { id: 1 as WizardStep, label: 'Recherche', icon: Search },
  { id: 2 as WizardStep, label: 'Lyrics', icon: FileText },
  { id: 3 as WizardStep, label: 'Création', icon: Sparkles },
] as const

export function LyricsWizard() {
  const { currentStep, canProceedToCard, goToStep, goToCard } = useCardParams()

  const canGoBack = currentStep > 1

  return (
    <div className='space-y-6'>
      {/* Step indicator */}
      <div className='flex items-center justify-center gap-2'>
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          // Can click back to previous steps, OR click forward to step 3 if allowed
          const canClickBack = step.id < currentStep
          const canClickForward = step.id === 3 && currentStep === 2 && canProceedToCard
          const isClickable = canClickBack || canClickForward

          return (
            <div key={step.id} className='flex items-center'>
              <button
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30',
                  canClickForward &&
                    'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 ring-2 ring-primary/50',
                  !isActive && !isCompleted && !canClickForward && 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className='h-4 w-4' />
                <span className='text-sm font-medium hidden sm:inline'>{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={cn('w-8 h-0.5 mx-1', isCompleted ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Back button */}
      {canGoBack && (
        <button
          onClick={() => goToStep((currentStep - 1) as WizardStep)}
          className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ChevronLeft className='h-4 w-4' />
          Retour
        </button>
      )}

      {/* Step content */}
      <div className='min-h-[500px]'>
        {currentStep === 1 && (
          <div className='max-w-xl mx-auto space-y-4'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold mb-2'>Trouve ta chanson</h2>
              <p className='text-muted-foreground'>Recherche par titre ou artiste</p>
            </div>
            <SearchSection />
          </div>
        )}

        {currentStep === 2 && (
          <div className='max-w-xl mx-auto space-y-4'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold mb-2'>Sélectionne tes lyrics</h2>
              <p className='text-muted-foreground'>Clique pour choisir un passage (max 8 lignes)</p>
            </div>
            <LyricsSection />

            {/* Continue button */}
            <button
              onClick={goToCard}
              disabled={!canProceedToCard}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all',
                canProceedToCard
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              Créer ma carte
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <CardPreviewSection />
          </div>
        )}
      </div>
    </div>
  )
}
