'use client'

import { useCallback, useMemo } from 'react'
import { useQueryState, parseAsString, parseAsInteger, parseAsBoolean, createParser } from 'nuqs'

// Step definitions
export type WizardStep = 1 | 2 | 3

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

export function useCardParams() {
  // ============================================
  // Wizard step (explicit in URL)
  // ============================================
  const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(1))

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
  const [infoPosition, setInfoPosition] = useQueryState(
    'infoPos',
    parseAsString.withDefault('bottom'),
  )

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
  // Derived state
  // ============================================
  const hasTrack = Boolean(trackId)
  const hasSelection = selectedLines.length > 0

  // Current step from URL, validated against data requirements
  const currentStep: WizardStep = useMemo(() => {
    // Step 3 requires track + selection
    if (step === 3 && hasTrack && hasSelection) return 3
    // Step 2 requires track
    if (step >= 2 && hasTrack) return 2
    // Default to step 1
    return 1
  }, [step, hasTrack, hasSelection])

  // First and last selected line numbers (for filenames)
  const linesRange = useMemo(() => {
    if (selectedLines.length === 0) return null
    const sorted = [...selectedLines].sort((a, b) => a - b)
    return { first: sorted[0], last: sorted[sorted.length - 1] }
  }, [selectedLines])

  // ============================================
  // Navigation actions
  // ============================================

  // Set track (advances from step 1 → 2)
  const selectTrack = useCallback(
    (track: { id: string; name: string; artist: string; artworkUrl: string | null }) => {
      // Clear any previous selection when selecting a new track
      setSelectedLines([])
      // Set track info and advance to step 2
      setTrackId(track.id)
      setTrackName(track.name)
      setArtistName(track.artist)
      setArtworkUrl(track.artworkUrl)
      setStep(2)
    },
    [setTrackId, setTrackName, setArtistName, setArtworkUrl, setSelectedLines, setStep],
  )

  // Go to step 1 (clears track and selection)
  const goToSearch = useCallback(() => {
    setStep(1)
    setTrackId(null)
    setTrackName(null)
    setArtistName(null)
    setArtworkUrl(null)
    setSelectedLines([])
  }, [setStep, setTrackId, setTrackName, setArtistName, setArtworkUrl, setSelectedLines])

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

  // Go to step 3 (requires track + selection)
  const goToCard = useCallback(() => {
    if (hasTrack && hasSelection) {
      setStep(3)
    }
  }, [setStep, hasTrack, hasSelection])

  // Navigate to a specific step
  const goToStep = useCallback(
    (targetStep: WizardStep) => {
      if (targetStep === 1) {
        goToSearch()
      } else if (targetStep === 2) {
        goToLyrics()
      } else if (targetStep === 3) {
        goToCard()
      }
    },
    [goToSearch, goToLyrics, goToCard],
  )

  // Check if can proceed to step 3
  const canProceedToCard = hasTrack && hasSelection

  // ============================================
  // Utility functions
  // ============================================
  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }, [])

  const resetAll = useCallback(() => {
    setStep(1)
    setTrackId(null)
    setArtistName(null)
    setTrackName(null)
    setArtworkUrl(null)
    setSelectedLines([])
    setTheme('blur-artwork')
    setCustomColor(null)
    setFontSizePx(24)
    setFormat('square')
    setTextAlign('left')
    setInfoPosition('bottom')
    setShowArtwork(true)
    setShowTitle(true)
    setShowArtist(true)
    setShowWatermark(true)
  }, [
    setStep,
    setTrackId,
    setArtistName,
    setTrackName,
    setArtworkUrl,
    setSelectedLines,
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

  return {
    // ============================================
    // Current step (from URL, validated)
    // ============================================
    currentStep,

    // ============================================
    // Track state
    // ============================================
    trackId,
    artistName,
    trackName,
    artworkUrl,

    // ============================================
    // Lyrics selection
    // ============================================
    selectedLines,
    setSelectedLines,
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
