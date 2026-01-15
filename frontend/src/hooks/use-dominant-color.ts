'use client'

import { useState, useEffect } from 'react'
import ColorThief from 'colorthief'
import { getProxiedImageUrl } from '@/lib/api'

export function useDominantColor(imageUrl: string | undefined) {
  const [dominantColor, setDominantColor] = useState<string | undefined>()
  const [palette, setPalette] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!imageUrl) {
      setDominantColor(undefined)
      setPalette([])
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      setIsLoading(true)
      try {
        const colorThief = new ColorThief()

        // Couleur dominante
        const dominant = colorThief.getColor(img)
        setDominantColor(rgbToHex(dominant[0], dominant[1], dominant[2]))

        // Palette
        const colors = colorThief.getPalette(img, 5)
        setPalette(colors.map(([r, g, b]: number[]) => rgbToHex(r, g, b)))
      } catch (err) {
        console.error('Error extracting color:', err)
      } finally {
        setIsLoading(false)
      }
    }

    img.onerror = () => {
      setDominantColor(undefined)
      setPalette([])
    }

    // Use proxied URL to avoid CORS issues
    img.src = getProxiedImageUrl(imageUrl) || imageUrl
  }, [imageUrl])

  return { dominantColor, palette, isLoading }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}
