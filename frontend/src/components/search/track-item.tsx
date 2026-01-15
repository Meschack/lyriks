'use client'

import { type Track, getPrimaryArtist, getArtworkUrl } from '@/types/track'
import { getProxiedImageUrl } from '@/lib/api'

interface TrackItemProps {
  track: Track
  onClick: () => void
}

export function TrackItem({ track, onClick }: TrackItemProps) {
  const artworkUrl = getProxiedImageUrl(getArtworkUrl(track, 'small'))
  const artist = getPrimaryArtist(track)

  return (
    <button
      onClick={onClick}
      className='flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors text-left'
    >
      {artworkUrl ? (
        <img
          src={artworkUrl}
          alt={track.album.name}
          width={48}
          height={48}
          className='rounded-md object-cover'
        />
      ) : (
        <div className='w-12 h-12 bg-muted rounded-md flex items-center justify-center'>
          <span className='text-muted-foreground text-xs'>No img</span>
        </div>
      )}
      <div className='flex-1 min-w-0'>
        <p className='font-medium truncate'>{track.name}</p>
        <p className='text-sm text-muted-foreground truncate'>
          {artist} • {track.album.name}
        </p>
      </div>
      {track.explicit && <span className='text-xs bg-muted px-1.5 py-0.5 rounded'>E</span>}
    </button>
  )
}
