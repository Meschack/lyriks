'use client'

import { useQuery } from '@tanstack/react-query'
import { searchTracks, type SearchResponse } from '@/lib/api'

export function useSearch(query: string, limit: number = 20) {
  return useQuery<SearchResponse>({
    queryKey: ['search', query, limit],
    queryFn: () => searchTracks(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
