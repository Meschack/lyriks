'use client'

import { type Track } from '@/types/track'
import { TrackItem } from './track-item'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchResultsProps {
  results: Track[]
  isLoading: boolean
  error: Error | null
  onSelect: (track: Track) => void
}

export function SearchResults({ results, isLoading, error, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className='space-y-2 p-2 bg-card rounded-lg border'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3 p-2'>
            <Skeleton className='w-12 h-12 rounded-md' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 bg-destructive/10 text-destructive rounded-lg'>
        Erreur lors de la recherche: {error.message}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className='p-4 text-center text-muted-foreground bg-card rounded-lg border'>
        Aucun résultat trouvé
      </div>
    )
  }

  return (
    <div className='bg-card rounded-lg border max-h-[400px] overflow-y-auto'>
      {results.map((track) => (
        <TrackItem key={track.id} track={track} onClick={() => onSelect(track)} />
      ))}
    </div>
  )
}
