'use client'

import { useMemo } from 'react'
import { useCardParams } from '@/hooks/use-card-params'
import { useLyrics } from '@/hooks/use-lyrics'
import { useDominantColor } from '@/hooks/use-dominant-color'
import { useExportImage } from '@/hooks/use-export-image'
import { CardCanvas } from './card-canvas'
import { CardControls } from './card-controls'
import { ExportButtons } from './export-buttons'
import type { CardTheme, CardFormat } from '@/types/card'

// Sanitize string for filename (remove special chars, replace spaces with dashes)
function sanitizeForFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) // Limit length
}

export function CardPreviewSection() {
  const {
    trackId,
    trackName,
    artistName,
    artworkUrl,
    selectedLines,
    linesRange,
    customLyrics,
    isCustomMode,
    theme,
    customColor,
    fontSizePx,
    format,
    infoPosition,
    showArtwork,
    showTitle,
    showArtist,
    showWatermark,
    hasTrack,
    hasSelection,
    getShareUrl,
  } = useCardParams()

  // Only fetch lyrics in search mode
  const { data: lyricsData } = useLyrics(
    isCustomMode ? null : trackId,
    isCustomMode ? null : trackName,
    isCustomMode ? null : artistName,
  )

  // Couleur dominante de la pochette
  const { dominantColor } = useDominantColor(artworkUrl ?? undefined)

  // Extraire les lignes sélectionnées (custom mode uses customLyrics directly)
  const selectedLyricsText = useMemo(() => {
    if (isCustomMode) {
      return customLyrics
    }
    return (
      lyricsData?.lyrics?.lines
        .filter((line) => selectedLines.includes(line.index))
        .map((line) => line.text) ?? []
    )
  }, [isCustomMode, customLyrics, lyricsData, selectedLines])

  // Card props for export API
  const cardProps = useMemo(
    () => ({
      lyrics: selectedLyricsText,
      trackName: trackName ?? '',
      artistName: artistName ?? '',
      artworkUrl: artworkUrl ?? undefined,
      dominantColor,
      theme: theme as CardTheme,
      customColor: customColor ?? undefined,
      fontSizePx,
      format: format as CardFormat,
      textAlign: 'left' as const,
      infoPosition: infoPosition as 'top' | 'bottom',
      showArtwork,
      showTitle,
      showArtist,
      showWatermark,
    }),
    [
      selectedLyricsText,
      trackName,
      artistName,
      artworkUrl,
      dominantColor,
      theme,
      customColor,
      fontSizePx,
      format,
      infoPosition,
      showArtwork,
      showTitle,
      showArtist,
      showWatermark,
    ],
  )

  const { exportToPng, exportToJpg, isExportingPng, isExportingJpg } = useExportImage({
    cardProps,
  })

  // Generate filename: {title}-{artist}-{format}-{lines}.{ext}
  const getFilename = (ext: 'png' | 'jpg') => {
    const title = sanitizeForFilename(trackName ?? 'untitled')
    const artist = sanitizeForFilename(artistName ?? 'unknown')
    // In custom mode, use line count; in search mode, use line range
    const linesStr = isCustomMode
      ? `${customLyrics.length}lines`
      : linesRange
        ? `${linesRange.first}-${linesRange.last}`
        : '0-0'
    return `${title}-${artist}-${format}-${linesStr}-${Date.now()}.${ext}`
  }

  // Pas prêt pour l'export
  const canExport = hasTrack && hasSelection && selectedLyricsText.length > 0

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:col-span-2'>
      {/* Left: Preview */}
      <div className='flex flex-col items-center justify-start'>
        <div className='sticky top-8'>
          <div className='rounded-xl border bg-card/50 p-4'>
            <CardCanvas
              lyrics={selectedLyricsText}
              trackName={trackName ?? ''}
              artistName={artistName ?? ''}
              artworkUrl={artworkUrl ?? undefined}
              dominantColor={dominantColor}
              theme={theme as CardTheme}
              customColor={customColor ?? undefined}
              fontSizePx={fontSizePx}
              format={format as CardFormat}
              infoPosition={infoPosition as 'top' | 'bottom'}
              showArtwork={showArtwork}
              showTitle={showTitle}
              showArtist={showArtist}
              showWatermark={showWatermark}
            />
          </div>

          {/* Export buttons under preview */}
          <div className='mt-4'>
            <ExportButtons
              onExportPng={() => exportToPng(getFilename('png'))}
              onExportJpg={() => exportToJpg(getFilename('jpg'))}
              shareUrl={getShareUrl()}
              disabled={!canExport}
              isExportingPng={isExportingPng}
              isExportingJpg={isExportingJpg}
            />
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className='space-y-6'>
        <div className='rounded-xl border bg-card p-5'>
          <h3 className='text-lg font-semibold mb-4'>Personnalise ta carte</h3>
          <CardControls />
        </div>
      </div>
    </div>
  )
}
