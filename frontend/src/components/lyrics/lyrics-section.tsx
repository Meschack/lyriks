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

  // No track selected
  if (!trackId) {
    return (
      <Card className='border-dashed'>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <Music className='h-12 w-12 mx-auto mb-4 opacity-50' />
          <p>Search and select a song to see the lyrics</p>
        </CardContent>
      </Card>
    )
  }

  // Loading
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

  // Error or no lyrics
  if (error || !data?.lyrics) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='py-8 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-4 text-destructive' />
          <p className='font-medium'>Lyrics not found</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {data?.error || 'Try with another song'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const { lyrics } = data

  // No lyrics content available
  if (!lyrics.lines || lyrics.lines.length === 0) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='py-8 text-center'>
          <AlertCircle className='h-8 w-8 mx-auto mb-4 text-destructive' />
          <p className='font-medium'>No lyrics available</p>
          <p className='text-sm text-muted-foreground mt-1'>
            This song may be instrumental or the lyrics may not be available.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Selection handling (improved contiguous selection)
  const handleLineClick = (index: number) => {
    if (selectedLines.length === 0) {
      // First selection
      setSelectedLines([index])
      return
    }

    const min = Math.min(...selectedLines)
    const max = Math.max(...selectedLines)

    // Click inside current range → new selection starting from this line
    if (index >= min && index <= max) {
      setSelectedLines([index])
      return
    }

    let newMin: number
    let newMax: number

    if (selectedLines.length === 1) {
      // Second click: select range between first line and this one
      newMin = Math.min(selectedLines[0], index)
      newMax = Math.max(selectedLines[0], index)
    } else if (index === min - 1) {
      // Extend selection upward
      newMin = index
      newMax = max
    } else if (index === max + 1) {
      // Extend selection downward
      newMin = min
      newMax = index
    } else {
      // Non-contiguous click → new selection
      setSelectedLines([index])
      return
    }

    const length = newMax - newMin + 1
    if (length > MAX_SELECTED_LINES) {
      // Don't exceed limit, keep current selection
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
              {selectedLines.length} line{selectedLines.length > 1 ? 's' : ''} selected
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-xs text-muted-foreground mb-4'>
          Click on a line to start selection, then on another to finish (max {MAX_SELECTED_LINES}{' '}
          lines)
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
