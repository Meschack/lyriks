export interface LyricLine {
  index: number;
  text: string;
  timestamp?: number;
}

export interface Lyrics {
  track_name: string;
  artist_name: string;
  album_name?: string;
  duration?: number;
  instrumental: boolean;
  lines: LyricLine[];
  synced: boolean;
}
