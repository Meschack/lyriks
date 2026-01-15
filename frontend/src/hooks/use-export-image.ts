'use client'

import { useState, useCallback } from 'react'
import type { SatoriCardProps } from '@/lib/satori-card'

type ExportFormat = 'png' | 'jpg'

interface UseExportImageOptions {
  cardProps: Omit<SatoriCardProps, 'artworkBase64'>
}

export function useExportImage({ cardProps }: UseExportImageOptions) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportImage = useCallback(
    async (format: ExportFormat, filename?: string) => {
      setIsExporting(true)
      setError(null)

      try {
        const response = await fetch('/api/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...cardProps,
            outputFormat: format,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Export failed')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const defaultFilename = `lyric-card.${format}`
        downloadUrl(url, filename || defaultFilename)

        URL.revokeObjectURL(url)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'export"
        setError(message)
        console.error(err)
      } finally {
        setIsExporting(false)
      }
    },
    [cardProps],
  )

  const exportToPng = useCallback(
    async (filename?: string) => {
      await exportImage('png', filename)
    },
    [exportImage],
  )

  const exportToJpg = useCallback(
    async (filename?: string) => {
      await exportImage('jpg', filename)
    },
    [exportImage],
  )

  const copyToClipboard = useCallback(async () => {
    setIsExporting(true)
    setError(null)

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cardProps,
          outputFormat: 'png',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Export failed')
      }

      const blob = await response.blob()

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la copie'
      setError(message)
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }, [cardProps])

  return {
    exportToPng,
    exportToJpg,
    copyToClipboard,
    isExporting,
    error,
  }
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}
