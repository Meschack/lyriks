import type { Track } from '@/types/track'
import type { Lyrics } from '@/types/lyrics'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error.detail || response.statusText, error)
  }

  return response.json()
}

export interface SearchResponse {
  query: string
  results: Track[]
  total: number
}

export interface LyricsResponse {
  track_id: string
  track_name: string
  artist_name: string
  lyrics: Lyrics | null
  cached: boolean
  error?: string
}

export async function searchTracks(query: string, limit: number = 20): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: limit.toString() })
  return fetchApi<SearchResponse>(`/api/search?${params}`)
}

export async function getLyrics(
  trackName: string,
  artistName: string,
  options?: {
    album?: string
    duration?: number
    trackId?: string
  },
): Promise<LyricsResponse> {
  const params = new URLSearchParams({
    track: trackName,
    artist: artistName,
  })

  if (options?.album) params.append('album', options.album)
  if (options?.duration) params.append('duration', options.duration.toString())
  if (options?.trackId) params.append('track_id', options.trackId)

  return fetchApi<LyricsResponse>(`/api/lyrics?${params}`)
}

export async function healthCheck(): Promise<{
  status: string
  service: string
}> {
  return fetchApi('/api/health')
}

/**
 * Get a proxied image URL to avoid CORS issues
 */
export function getProxiedImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const params = new URLSearchParams({ url })
  return `${API_URL}/api/image?${params}`
}

/**
 * Fetch image as base64 data URI for export
 */
export async function getImageAsBase64(url: string): Promise<string> {
  const params = new URLSearchParams({ url })
  const response = await fetchApi<{ data_uri: string }>(`/api/image/base64?${params}`)
  return response.data_uri
}
