'use client'

import { useLyrics } from '@/hooks/use-lyrics'
import { useCardParams } from '@/hooks/use-card-params'
import { LyricsLine } from './lyrics-line'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Music } from 'lucide-react'
import { MAX_SELECTED_LINES } from '@/lib/constants'

export function LyricsSection() {
  const { trackId, trackName, artistName, selectedLines, setSelectedLines } = useCardParams()
  const { data, isLoading, error } = useLyrics(trackId, trackName, artistName)

  // Pas de track sélectionné
  if (!trackId) {
    return (
      <Card className='border-dashed'>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <Music className='h-12 w-12 mx-auto mb-4 opacity-50' />
          <p>Recherche et sélectionne une chanson pour voir les lyrics</p>
        </CardContent>
      </Card>
    )
  }

  // Chargement
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
        </CardHeader>
        <CardContent className='space-y-2'>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className='h-6 w-full' />
          ))}
        </CardContent>
      </Card>
    )
  }

  // Erreur ou pas de lyrics
  if (error || !data?.lyrics) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='py-8 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-4 text-destructive' />
          <p className='font-medium'>Lyrics introuvables</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {data?.error || 'Essaie avec une autre chanson'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const { lyrics } = data

  // Gestion de la sélection
  const handleLineClick = (index: number) => {
    const currentSelection = [...selectedLines]

    if (currentSelection.length === 0) {
      // Première sélection
      setSelectedLines([index])
    } else if (currentSelection.length === 1) {
      // Deuxième clic : sélectionner la plage
      const start = Math.min(currentSelection[0], index)
      const end = Math.max(currentSelection[0], index)
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i)

      // Limiter à MAX_SELECTED_LINES lignes
      if (range.length <= MAX_SELECTED_LINES) {
        setSelectedLines(range)
      }
    } else {
      // Reset et nouvelle sélection
      setSelectedLines([index])
    }
  }

  const isLineSelected = (index: number) => selectedLines.includes(index)
  const isLineInRange = (index: number) => {
    if (selectedLines.length < 2) return false
    const min = Math.min(...selectedLines)
    const max = Math.max(...selectedLines)
    return index >= min && index <= max
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg flex items-center justify-between'>
          <span>Lyrics</span>
          {selectedLines.length > 0 && (
            <span className='text-sm font-normal text-muted-foreground'>
              {selectedLines.length} ligne{selectedLines.length > 1 ? 's' : ''} sélectionnée
              {selectedLines.length > 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-xs text-muted-foreground mb-4'>
          Clique sur une ligne pour commencer la sélection, puis sur une autre pour terminer (max{' '}
          {MAX_SELECTED_LINES} lignes)
        </p>

        <div className='space-y-1 max-h-[400px] overflow-y-auto'>
          {lyrics.lines.map((line) => (
            <LyricsLine
              key={line.index}
              line={line}
              isSelected={isLineSelected(line.index)}
              isInRange={isLineInRange(line.index)}
              onClick={() => handleLineClick(line.index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
