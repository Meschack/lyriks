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

  // Aucun contenu de lyrics disponible
  if (!lyrics.lines || lyrics.lines.length === 0) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='py-8 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-4 text-destructive' />
          <p className='font-medium'>Aucune ligne de lyrics disponible</p>
          <p className='text-sm text-muted-foreground mt-1'>
            Il se peut que cette chanson soit instrumentale ou que les paroles ne soient pas
            disponibles.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Gestion de la sélection (sélection contiguë améliorée)
  const handleLineClick = (index: number) => {
    if (selectedLines.length === 0) {
      // Première sélection
      setSelectedLines([index])
      return
    }

    const min = Math.min(...selectedLines)
    const max = Math.max(...selectedLines)

    // Clic à l'intérieur de la plage actuelle → nouvelle sélection à partir de cette ligne
    if (index >= min && index <= max) {
      setSelectedLines([index])
      return
    }

    let newMin: number
    let newMax: number

    if (selectedLines.length === 1) {
      // Deuxième clic : sélectionner la plage entre la première ligne et celle-ci
      newMin = Math.min(selectedLines[0], index)
      newMax = Math.max(selectedLines[0], index)
    } else if (index === min - 1) {
      // Étendre la sélection vers le haut
      newMin = index
      newMax = max
    } else if (index === max + 1) {
      // Étendre la sélection vers le bas
      newMin = min
      newMax = index
    } else {
      // Clic non contigu → nouvelle sélection
      setSelectedLines([index])
      return
    }

    const length = newMax - newMin + 1
    if (length > MAX_SELECTED_LINES) {
      // Ne pas dépasser la limite, on garde la sélection actuelle
      return
    }

    const range = Array.from({ length }, (_, i) => newMin + i)
    setSelectedLines(range)
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
