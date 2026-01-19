export const CARD_FONT_SIZES = {
  small: 'text-lg leading-snug',
  medium: 'text-2xl leading-snug',
  large: 'text-4xl leading-tight',
} as const

// Logical layout dimensions in pixels. The exported images are scaled up
// by EXPORT_SCALE_FACTOR so that all elements (text, artwork, watermark, etc.)
// keep the same proportions as in the in-app preview.
export const CARD_FORMATS = {
  square: { width: 400, height: 400, label: 'Square (1:1)' },
  portrait: { width: 400, height: 500, label: 'Portrait (4:5)' },
  story: { width: 270, height: 480, label: 'Story (9:16)' },
} as const

// Factor used when rasterizing SVGs for export (e.g. 400x400 → 1600x1600)
export const EXPORT_SCALE_FACTOR = 8

export const CARD_THEMES = {
  'gradient-spotify': {
    name: 'Spotify',
    preview: 'linear-gradient(180deg, #1DB954 0%, #191414 100%)',
  },
  'gradient-purple': {
    name: 'Purple',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  'gradient-sunset': {
    name: 'Sunset',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  'gradient-ocean': {
    name: 'Ocean',
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  'gradient-dark': {
    name: 'Dark',
    preview: 'linear-gradient(180deg, #2d3436 0%, #000000 100%)',
  },
  'solid-black': { name: 'Black', preview: '#000000' },
  'solid-white': { name: 'White', preview: '#ffffff' },
  'blur-artwork': { name: 'Blur', preview: 'blur' },
  custom: { name: 'Custom', preview: 'custom' },
} as const

export const MAX_SELECTED_LINES = 8
export const MIN_SELECTED_LINES = 1

// Custom card mode limits
export const MAX_CUSTOM_LINES = 8
export const MIN_CUSTOM_LINES = 1
export const MAX_TITLE_LENGTH = 100
export const MAX_ARTIST_LENGTH = 100
export const MAX_LINE_LENGTH = 200

export const SEARCH_DEBOUNCE_MS = 300

export const SEARCH_CACHE_TTL = 3600
export const LYRICS_CACHE_TTL = 86400
