"use client";

import { useQuery } from "@tanstack/react-query";
import { getLyrics, type LyricsResponse } from "@/lib/api";

export function useLyrics(
  trackId: string | null,
  trackName: string | null,
  artistName: string | null,
  options?: {
    album?: string;
    duration?: number;
  }
) {
  return useQuery<LyricsResponse>({
    queryKey: ["lyrics", trackId, trackName, artistName],
    queryFn: () =>
      getLyrics(trackName!, artistName!, {
        ...options,
        trackId: trackId || undefined,
      }),
    enabled: Boolean(trackName && artistName),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
