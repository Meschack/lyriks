'use client'

import { useCallback, useMemo, useEffect, useRef } from 'react'
import { useQueryState, parseAsString, parseAsInteger, parseAsBoolean, createParser } from 'nuqs'

// Step definitions
export type WizardStep = 1 | 2 | 3

// LocalStorage key for persisting customization preferences
const PREFERENCES_STORAGE_KEY = 'lyriks-card-preferences'

// Customization preferences type
interface CardPreferences {
  theme: string
  customColor: string | null
  fontSizePx: number
  format: string
  textAlign: string
  infoPosition: string
  showArtwork: boolean
  showTitle: boolean
  showArtist: boolean
  showWatermark: boolean
}

// Default preferences
const DEFAULT_PREFERENCES: CardPreferences = {
  theme: 'blur-artwork',
  customColor: null,
  fontSizePx: 24,
  format: 'square',
  textAlign: 'left',
  infoPosition: 'top',
  showArtwork: true,
  showTitle: true,
  showArtist: true,
  showWatermark: true,
}

// Load preferences from localStorage
function loadPreferences(): CardPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_PREFERENCES
}

// Save preferences to localStorage
function savePreferences(prefs: CardPreferences): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore errors (e.g., localStorage full)
  }
}

// Mode definitions
export type CardMode = 'search' | 'custom'

// Custom parser for lines range (e.g., "2-5" instead of "2,3,4,5")
const parseAsLinesRange = createParser({
  parse: (value: string) => {
    if (!value) return []
    const [start, end] = value.split('-').map(Number)
    if (isNaN(start)) return []
    if (isNaN(end)) return [start] // Single line: "2" → [2]
    // Generate array from start to end inclusive
    const lines: number[] = []
    for (let i = start; i <= end; i++) {
      lines.push(i)
    }
    return lines
  },
  serialize: (value: number[]) => {
    if (!value || value.length === 0) return ''
    if (value.length === 1) return String(value[0])
    const sorted = [...value].sort((a, b) => a - b)
    return `${sorted[0]}-${sorted[sorted.length - 1]}`
  },
})

// Custom parser for custom lyrics (Base64-encoded JSON array)
const parseAsCustomLyrics = createParser({
  parse: (value: string) => {
    if (!value) return []
    try {
      const decoded = JSON.parse(atob(value))
      return Array.isArray(decoded.lines) ? decoded.lines : []
    } catch {
      return []
    }
  },
  serialize: (value: string[]) => {
    if (!value || value.length === 0) return ''
    return btoa(JSON.stringify({ lines: value }))
  },
})

export function useCardParams() {
  // ============================================
  // Wizard step and mode (explicit in URL)
  // ============================================
  const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(1))
  const [mode, setMode] = useQueryState('mode', parseAsString.withDefault('search'))

  // ============================================
  // Custom mode: lyrics as text (Base64-encoded)
  // ============================================
  const [customLyrics, setCustomLyrics] = useQueryState(
    'customLyrics',
    parseAsCustomLyrics.withDefault([]),
  )

  // ============================================
  // Track info (Step 1 → Step 2 transition)
  // ============================================
  const [trackId, setTrackId] = useQueryState('track', parseAsString)
  const [artistName, setArtistName] = useQueryState('artist', parseAsString)
  const [trackName, setTrackName] = useQueryState('name', parseAsString)
  const [artworkUrl, setArtworkUrl] = useQueryState('artwork', parseAsString)

  // ============================================
  // Lyrics selection (range format: "2-5")
  // ============================================
  const [selectedLines, setSelectedLines] = useQueryState(
    'lines',
    parseAsLinesRange.withDefault([]),
  )

  // ============================================
  // Card customization (Step 3)
  // ============================================
  const [theme, setTheme] = useQueryState('theme', parseAsString.withDefault('blur-artwork'))
  const [customColor, setCustomColor] = useQueryState('color', parseAsString)
  const [fontSizePx, setFontSizePx] = useQueryState('size', parseAsInteger.withDefault(24))
  const [format, setFormat] = useQueryState('format', parseAsString.withDefault('square'))
  const [textAlign, setTextAlign] = useQueryState('align', parseAsString.withDefault('left'))
  const [infoPosition, setInfoPosition] = useQueryState('infoPos', parseAsString.withDefault('top'))

  // Display toggles
  const [showArtwork, setShowArtwork] = useQueryState(
    'showArtwork',
    parseAsBoolean.withDefault(true),
  )
  const [showTitle, setShowTitle] = useQueryState('showTitle', parseAsBoolean.withDefault(true))
  const [showArtist, setShowArtist] = useQueryState('showArtist', parseAsBoolean.withDefault(true))
  const [showWatermark, setShowWatermark] = useQueryState(
    'watermark',
    parseAsBoolean.withDefault(true),
  )

  // ============================================
  // LocalStorage persistence for preferences
  // ============================================
  const hasLoadedPrefs = useRef(false)

  // Load preferences from localStorage on mount (only if no URL params override)
  useEffect(() => {
    if (hasLoadedPrefs.current) return
    hasLoadedPrefs.current = true

    // Check if URL has customization params (meaning user came from a shared link)
    const urlParams = new URLSearchParams(window.location.search)
    const hasUrlCustomization =
      urlParams.has('theme') || urlParams.has('format') || urlParams.has('size')

    // If URL already has customization params, don't override with localStorage
    if (hasUrlCustomization) return

    // Load saved preferences
    const prefs = loadPreferences()

    // Apply saved preferences
    setTheme(prefs.theme)
    if (prefs.customColor) setCustomColor(prefs.customColor)
    setFontSizePx(prefs.fontSizePx)
    setFormat(prefs.format)
    setTextAlign(prefs.textAlign)
    setInfoPosition(prefs.infoPosition)
    setShowArtwork(prefs.showArtwork)
    setShowTitle(prefs.showTitle)
    setShowArtist(prefs.showArtist)
    setShowWatermark(prefs.showWatermark)
  }, [
    setTheme,
    setCustomColor,
    setFontSizePx,
    setFormat,
    setTextAlign,
    setInfoPosition,
    setShowArtwork,
    setShowTitle,
    setShowArtist,
    setShowWatermark,
  ])

  // Save preferences to localStorage when they change
  useEffect(() => {
    // Skip during initial load
    if (!hasLoadedPrefs.current) return

    savePreferences({
      theme: theme ?? DEFAULT_PREFERENCES.theme,
      customColor: customColor ?? null,
      fontSizePx: fontSizePx ?? DEFAULT_PREFERENCES.fontSizePx,
      format: format ?? DEFAULT_PREFERENCES.format,
      textAlign: textAlign ?? DEFAULT_PREFERENCES.textAlign,
      infoPosition: infoPosition ?? DEFAULT_PREFERENCES.infoPosition,
      showArtwork: showArtwork ?? DEFAULT_PREFERENCES.showArtwork,
      showTitle: showTitle ?? DEFAULT_PREFERENCES.showTitle,
      showArtist: showArtist ?? DEFAULT_PREFERENCES.showArtist,
      showWatermark: showWatermark ?? DEFAULT_PREFERENCES.showWatermark,
    })
  }, [
    theme,
    customColor,
    fontSizePx,
    format,
    textAlign,
    infoPosition,
    showArtwork,
    showTitle,
    showArtist,
    showWatermark,
  ])

  // ============================================
  // Derived state
  // ============================================
  const isCustomMode = mode === 'custom'

  // In search mode: need trackId. In custom mode: need trackName + artistName
  const hasTrack = isCustomMode ? Boolean(trackName && artistName) : Boolean(trackId)

  // In search mode: need selected line indices. In custom mode: need custom lyrics
  const hasSelection = isCustomMode ? customLyrics.length > 0 : selectedLines.length > 0

  // Current step from URL, validated against data requirements
  // Custom mode: step 1 = form, step 2 = card customization (no step 3)
  // Search mode: step 1 = search, step 2 = lyrics, step 3 = card
  const currentStep: WizardStep = useMemo(() => {
    if (isCustomMode) {
      // Custom mode: step 2 is card customization (requires track + lyrics)
      if (step >= 2 && hasTrack && hasSelection) return 2
      return 1
    }
    // Search mode (original logic)
    // Step 3 requires track + selection
    if (step === 3 && hasTrack && hasSelection) return 3
    // Step 2 requires track
    if (step >= 2 && hasTrack) return 2
    // Default to step 1
    return 1
  }, [step, isCustomMode, hasTrack, hasSelection])

  // First and last selected line numbers (for filenames)
  const linesRange = useMemo(() => {
    if (selectedLines.length === 0) return null
    const sorted = [...selectedLines].sort((a, b) => a - b)
    return { first: sorted[0], last: sorted[sorted.length - 1] }
  }, [selectedLines])

  // ============================================
  // Navigation actions
  // ============================================

  // Set track (advances from step 1 → 2) - search mode
  const selectTrack = useCallback(
    (track: { id: string; name: string; artist: string; artworkUrl: string | null }) => {
      // Clear any previous selection when selecting a new track
      setSelectedLines([])
      setCustomLyrics([])
      // Set track info and advance to step 2
      setTrackId(track.id)
      setTrackName(track.name)
      setArtistName(track.artist)
      setArtworkUrl(track.artworkUrl)
      setMode('search')
      setStep(2)
    },
    [
      setTrackId,
      setTrackName,
      setArtistName,
      setArtworkUrl,
      setSelectedLines,
      setCustomLyrics,
      setMode,
      setStep,
    ],
  )

  // Set custom card data (advances from step 1 → 2) - custom mode
  const setCustomCard = useCallback(
    (data: { title: string; artist: string; artworkUrl: string | null; lines: string[] }) => {
      // Clear search mode data
      setTrackId(null)
      setSelectedLines([])
      // Set custom card info
      setTrackName(data.title)
      setArtistName(data.artist)
      setArtworkUrl(data.artworkUrl)
      setCustomLyrics(data.lines)
      setMode('custom')
      setStep(2)
    },
    [
      setTrackId,
      setTrackName,
      setArtistName,
      setArtworkUrl,
      setSelectedLines,
      setCustomLyrics,
      setMode,
      setStep,
    ],
  )

  // Go to step 1 (clears track and selection, resets to search mode)
  const goToSearch = useCallback(() => {
    setStep(1)
    setMode('search')
    setTrackId(null)
    setTrackName(null)
    setArtistName(null)
    setArtworkUrl(null)
    setSelectedLines([])
    setCustomLyrics([])
  }, [
    setStep,
    setMode,
    setTrackId,
    setTrackName,
    setArtistName,
    setArtworkUrl,
    setSelectedLines,
    setCustomLyrics,
  ])

  // Go to step 2 (keeps track, can optionally clear selection)
  const goToLyrics = useCallback(
    (clearSelection = false) => {
      setStep(2)
      if (clearSelection) {
        setSelectedLines([])
      }
    },
    [setStep, setSelectedLines],
  )

  // Go to card step (step 2 in custom mode, step 3 in search mode)
  const goToCard = useCallback(() => {
    if (hasTrack && hasSelection) {
      // In custom mode, card is at step 2
      setStep(isCustomMode ? 2 : 3)
    }
  }, [setStep, hasTrack, hasSelection, isCustomMode])

  // Navigate to a specific step
  const goToStep = useCallback(
    (targetStep: WizardStep) => {
      if (targetStep === 1) {
        goToSearch()
      } else if (targetStep === 2) {
        // In custom mode, step 2 is the card
        if (isCustomMode) {
          goToCard()
        } else {
          goToLyrics()
        }
      } else if (targetStep === 3) {
        goToCard()
      }
    },
    [goToSearch, goToLyrics, goToCard, isCustomMode],
  )

  // Check if can proceed to card (step 3 in search mode, step 2 in custom mode)
  const canProceedToCard = hasTrack && hasSelection

  // ============================================
  // Utility functions
  // ============================================
  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }, [])

  const resetAll = useCallback(() => {
    // Reset navigation and track data
    setStep(1)
    setMode('search')
    setTrackId(null)
    setArtistName(null)
    setTrackName(null)
    setArtworkUrl(null)
    setSelectedLines([])
    setCustomLyrics([])
    // Note: Customization preferences (theme, format, etc.) are preserved
    // so users keep their preferred settings when creating a new card
  }, [
    setStep,
    setMode,
    setTrackId,
    setArtistName,
    setTrackName,
    setArtworkUrl,
    setSelectedLines,
    setCustomLyrics,
  ])

  return {
    // ============================================
    // Current step and mode (from URL, validated)
    // ============================================
    currentStep,
    mode,
    setMode,
    isCustomMode,

    // ============================================
    // Track state
    // ============================================
    trackId,
    artistName,
    trackName,
    artworkUrl,

    // ============================================
    // Lyrics selection (search mode: indices, custom mode: text)
    // ============================================
    selectedLines,
    setSelectedLines,
    customLyrics,
    setCustomLyrics,
    linesRange,

    // ============================================
    // Card customization
    // ============================================
    theme,
    setTheme,
    customColor,
    setCustomColor,
    fontSizePx,
    setFontSizePx,
    format,
    setFormat,
    textAlign,
    setTextAlign,
    infoPosition,
    setInfoPosition,
    showArtwork,
    setShowArtwork,
    showTitle,
    setShowTitle,
    showArtist,
    setShowArtist,
    showWatermark,
    setShowWatermark,

    // ============================================
    // Computed flags
    // ============================================
    hasTrack,
    hasSelection,
    canProceedToCard,

    // ============================================
    // Navigation actions
    // ============================================
    selectTrack,
    setCustomCard,
    goToSearch,
    goToLyrics,
    goToCard,
    goToStep,

    // ============================================
    // Utility
    // ============================================
    getShareUrl,
    resetAll,
  }
}
