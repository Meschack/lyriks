import { NextRequest, NextResponse } from 'next/server'
import satori from 'satori'
import sharp from 'sharp'
import { SatoriCard, type SatoriCardProps } from '@/lib/satori-card'
import { CARD_FORMATS } from '@/lib/constants'
import type { CardFormat } from '@/types/card'

// Cache fonts in memory
let fontsCache: { data: ArrayBuffer; name: string; weight: number; style: string }[] | null = null

async function loadFonts() {
  if (fontsCache) return fontsCache

  try {
    // Load Inter fonts from Google Fonts CDN
    const [regular, bold] = await Promise.all([
      fetch(
        'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf',
      ).then((res) => res.arrayBuffer()),
      fetch(
        'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf',
      ).then((res) => res.arrayBuffer()),
    ])

    fontsCache = [
      { data: regular, name: 'Inter', weight: 400, style: 'normal' },
      { data: bold, name: 'Inter', weight: 700, style: 'normal' },
    ]

    return fontsCache
  } catch (error) {
    console.error('Error loading fonts:', error)
    return []
  }
}

// Fetch image and convert to base64
async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  if (!url) return undefined

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LyriksBot/1.0)',
      },
    })

    if (!response.ok) return undefined

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image:', error)
    return undefined
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      lyrics = [],
      trackName = '',
      artistName = '',
      artworkUrl,
      dominantColor,
      theme = 'gradient-spotify',
      customColor,
      fontSizePx = 24,
      format = 'square' as CardFormat,
      textAlign = 'center',
      showArtwork = true,
      showTitle = true,
      showArtist = true,
      showWatermark = true,
      infoPosition = 'bottom',
      outputFormat = 'png',
    } = body

    // Validate format
    if (!CARD_FORMATS[format as CardFormat]) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const dimensions = CARD_FORMATS[format as CardFormat]

    // Load fonts
    const fonts = await loadFonts()
    if (fonts.length === 0) {
      return NextResponse.json({ error: 'Failed to load fonts' }, { status: 500 })
    }

    // Fetch artwork as base64 for embedding in SVG
    const artworkBase64 = artworkUrl ? await fetchImageAsBase64(artworkUrl) : undefined

    // Prepare card props
    const cardProps: SatoriCardProps = {
      lyrics,
      trackName,
      artistName,
      artworkUrl: artworkBase64,
      artworkBase64,
      dominantColor,
      theme,
      customColor,
      fontSizePx,
      format,
      textAlign,
      showArtwork,
      showTitle,
      showArtist,
      showWatermark,
      infoPosition,
    }

    // Generate SVG with Satori
    const svg = await satori(SatoriCard(cardProps), {
      width: dimensions.width,
      height: dimensions.height,
      fonts: fonts as {
        data: ArrayBuffer
        name: string
        weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
        style: 'normal' | 'italic'
      }[],
    })

    // Convert SVG to image with Sharp
    let imageBuffer: Buffer
    let contentType: string

    if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
      imageBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 100 }).toBuffer()
      contentType = 'image/jpeg'
    } else {
      imageBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
      contentType = 'image/png'
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="lyric-card.${
          outputFormat === 'jpg' || outputFormat === 'jpeg' ? 'jpg' : 'png'
        }"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 },
    )
  }
}
