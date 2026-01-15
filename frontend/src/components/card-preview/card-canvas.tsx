'use client'

import { cn } from '@/lib/utils'
import { CARD_FORMATS } from '@/lib/constants'
import { adjustBrightness } from '@/hooks/use-dominant-color'
import { getProxiedImageUrl } from '@/lib/api'
import type { CardTheme, CardFormat } from '@/types/card'

interface CardCanvasProps {
  lyrics: string[]
  trackName: string
  artistName: string
  artworkUrl?: string
  dominantColor?: string
  theme: CardTheme
  customColor?: string
  fontSizePx: number
  format: CardFormat
  showArtwork: boolean
  showTitle: boolean
  showArtist: boolean
  showWatermark: boolean
  infoPosition?: 'top' | 'bottom'
}

export function CardCanvas({
  lyrics,
  trackName,
  artistName,
  artworkUrl,
  dominantColor,
  theme,
  customColor,
  fontSizePx,
  format,
  showArtwork,
  showTitle,
  showArtist,
  showWatermark,
  infoPosition = 'bottom',
}: CardCanvasProps) {
  const dimensions = CARD_FORMATS[format]
  const aspectRatio = dimensions.width / dimensions.height

  // Use proxied URL for CORS
  const proxiedArtworkUrl = getProxiedImageUrl(artworkUrl)

  const backgroundStyle = getBackgroundStyle(theme, dominantColor, customColor)
  const isEmpty = lyrics.length === 0

  return (
    <div
      className='relative overflow-hidden rounded-lg flex flex-col justify-center items-center'
      style={{
        aspectRatio,
        width: '100%',
        maxWidth: format === 'story' ? '270px' : '400px',
        fontFamily: 'var(--font-sf-pro), system-ui, sans-serif',
        color: '#ffffff',
        ...backgroundStyle,
      }}
    >
      {/* Background image for blur-artwork theme */}
      {theme === 'blur-artwork' && proxiedArtworkUrl && (
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: `url(${proxiedArtworkUrl})`,
            filter: 'blur(30px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Overlay pour le contraste */}
      <div className='absolute inset-0' style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} />

      {/* Contenu */}
      <div
        className={cn(
          'relative z-10 flex flex-col h-full w-full p-6',
          infoPosition === 'top' ? 'justify-start' : 'justify-end',
        )}
      >
        {/* Info track (position top) */}
        {infoPosition === 'top' && (showArtwork || showTitle || showArtist) && (
          <TrackInfo
            artworkUrl={proxiedArtworkUrl}
            trackName={trackName}
            artistName={artistName}
            showArtwork={showArtwork}
            showTitle={showTitle}
            showArtist={showArtist}
            className='mb-auto'
          />
        )}

        {/* Lyrics */}
        <div
          className={cn('flex-1 flex flex-col justify-center font-bold', 'items-start text-left')}
        >
          {isEmpty ? (
            <p className='text-sm' style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Sélectionne des lyrics pour prévisualiser
            </p>
          ) : (
            lyrics.map((line, i) => (
              <p
                key={i}
                style={{ color: '#ffffff', fontSize: `${fontSizePx}px`, lineHeight: 1.25 }}
              >
                {line}
              </p>
            ))
          )}
        </div>

        {/* Info track (position bottom) */}
        {infoPosition === 'bottom' && (showArtwork || showTitle || showArtist) && (
          <TrackInfo
            artworkUrl={proxiedArtworkUrl}
            trackName={trackName}
            artistName={artistName}
            showArtwork={showArtwork}
            showTitle={showTitle}
            showArtist={showArtist}
            className='mt-auto'
          />
        )}

        {/* Watermark */}
        {showWatermark && (
          <div
            className='absolute bottom-2 right-2 text-xs'
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            dub.sh/lyriks
          </div>
        )}
      </div>
    </div>
  )
}

interface TrackInfoProps {
  artworkUrl?: string
  trackName: string
  artistName: string
  showArtwork: boolean
  showTitle: boolean
  showArtist: boolean
  className?: string
}

const TrackInfo = ({
  artworkUrl,
  trackName,
  artistName,
  showArtwork,
  showTitle,
  showArtist,
  className,
}: TrackInfoProps) => {
  if (!showArtwork && !showTitle && !showArtist) return null

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {showArtwork && artworkUrl && (
        <img
          src={artworkUrl}
          alt='Album artwork'
          className='size-12 rounded-sm shadow-lg'
          crossOrigin='anonymous'
        />
      )}
      <div style={{ color: '#ffffff' }}>
        {showTitle && <p className='font-semibold truncate'>{trackName}</p>}
        {showArtist && (
          <p
            className='text-sm truncate font-semibold'
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {artistName}
          </p>
        )}
      </div>
    </div>
  )
}

function getBackgroundStyle(
  theme: CardTheme,
  dominantColor?: string,
  customColor?: string,
): React.CSSProperties {
  switch (theme) {
    case 'gradient-spotify':
      return {
        background: dominantColor
          ? `linear-gradient(180deg, ${dominantColor} 0%, ${adjustBrightness(
              dominantColor,
              -50,
            )} 100%)`
          : 'linear-gradient(180deg, #1DB954 0%, #191414 100%)',
      }
    case 'gradient-purple':
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }
    case 'gradient-sunset':
      return {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      }
    case 'gradient-ocean':
      return {
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      }
    case 'gradient-dark':
      return {
        background: 'linear-gradient(180deg, #2d3436 0%, #000000 100%)',
      }
    case 'solid-black':
      return { background: '#000000' }
    case 'solid-white':
      return { background: '#ffffff' }
    case 'blur-artwork':
      return { background: '#1a1a1a' }
    case 'custom':
      return { background: customColor || '#1a1a1a' }
    default:
      return { background: '#1a1a1a' }
  }
}
