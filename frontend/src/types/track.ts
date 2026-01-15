export interface Artist {
  id: string;
  name: string;
}

export interface AlbumImage {
  url: string;
  height: number;
  width: number;
}

export interface Album {
  id: string;
  name: string;
  images: AlbumImage[];
  release_date?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  explicit: boolean;
  preview_url?: string;
}

export const getPrimaryArtist = (track: Track): string =>
  track.artists[0]?.name ?? "Unknown Artist";

export const getArtworkUrl = (
  track: Track,
  size: "small" | "medium" | "large" = "large"
): string | undefined => {
  const images = track.album.images;
  if (!images.length) return undefined;

  switch (size) {
    case "small":
      return images[images.length - 1]?.url;
    case "medium":
      return images[Math.floor(images.length / 2)]?.url;
    case "large":
      return images[0]?.url;
  }
};
