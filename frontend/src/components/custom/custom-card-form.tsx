'use client'

import { useState, useRef, useCallback } from 'react'
import posthog from 'posthog-js'
import { Image as ImageIcon, X, ChevronRight, Plus, Trash2, Loader2, Check } from 'lucide-react'
import { useCardParams } from '@/hooks/use-card-params'
import { validateImageUrl } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MAX_CUSTOM_LINES, MAX_TITLE_LENGTH, MAX_ARTIST_LENGTH } from '@/lib/constants'

type ImageValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export function CustomCardForm() {
  const { setCustomCard } = useCardParams()

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [artworkUrl, setArtworkUrl] = useState('')
  const [lines, setLines] = useState<string[]>([''])

  // Image validation state
  const [imageValidation, setImageValidation] = useState<ImageValidationState>('idle')
  const [imageError, setImageError] = useState<string | null>(null)
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filter out empty lines for validation and submission
  const nonEmptyLines = lines.map((line) => line.trim()).filter((line) => line.length > 0)
  const lineCount = nonEmptyLines.length

  // Validation
  const isTitleValid = title.trim().length > 0 && title.length <= MAX_TITLE_LENGTH
  const isArtistValid = artist.trim().length > 0 && artist.length <= MAX_ARTIST_LENGTH
  const isLyricsValid = lineCount >= 1 && lineCount <= MAX_CUSTOM_LINES
  const isImageValid = !artworkUrl.trim() || imageValidation === 'valid'

  const canSubmit = isTitleValid && isArtistValid && isLyricsValid && isImageValid

  // Handle artwork URL change with debounced validation
  const handleArtworkUrlChange = useCallback((value: string) => {
    setArtworkUrl(value)

    // Clear any pending validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    const url = value.trim()

    if (!url) {
      setImageValidation('idle')
      setImageError(null)
      return
    }

    // Basic URL format check
    try {
      new URL(url)
    } catch {
      setImageValidation('invalid')
      setImageError('Please enter a valid URL')
      return
    }

    // Start validation with debounce
    setImageValidation('validating')
    setImageError(null)

    validationTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await validateImageUrl(url)
        if (result.valid) {
          setImageValidation('valid')
          setImageError(null)
        } else {
          setImageValidation('invalid')
          setImageError(result.error || 'This URL does not point to a valid image')
        }
      } catch {
        setImageValidation('invalid')
        setImageError('Failed to validate image URL')
      }
    }, 500)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    posthog.capture('custom_card_created', {
      has_artwork: Boolean(artworkUrl.trim()),
      artwork_type: artworkUrl.trim() ? 'url' : 'none',
      lines_count: nonEmptyLines.length,
    })

    setCustomCard({
      title: title.trim(),
      artist: artist.trim(),
      artworkUrl: artworkUrl.trim() || null,
      lines: nonEmptyLines,
    })
  }

  // Line management
  const addLine = () => {
    if (lines.length < MAX_CUSTOM_LINES) {
      setLines([...lines, ''])
    }
  }

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index))
    }
  }

  const updateLine = (index: number, value: string) => {
    const newLines = [...lines]
    newLines[index] = value
    setLines(newLines)
  }

  const clearArtwork = () => {
    setArtworkUrl('')
    setImageValidation('idle')
    setImageError(null)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title */}
      <div className='space-y-2'>
        <Label htmlFor='title'>Title</Label>
        <Input
          id='title'
          type='text'
          placeholder='Song or book title...'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LENGTH}
        />
        <p className='text-xs text-muted-foreground text-right'>
          {title.length}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      {/* Artist */}
      <div className='space-y-2'>
        <Label htmlFor='artist'>Artist / Author</Label>
        <Input
          id='artist'
          type='text'
          placeholder='Artist or author name...'
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          maxLength={MAX_ARTIST_LENGTH}
        />
        <p className='text-xs text-muted-foreground text-right'>
          {artist.length}/{MAX_ARTIST_LENGTH}
        </p>
      </div>

      {/* Artwork URL */}
      <div className='space-y-2'>
        <Label>Artwork URL (optional)</Label>

        {/* Preview when valid */}
        {imageValidation === 'valid' && artworkUrl.trim() && (
          <div className='relative w-24 h-24 rounded-lg overflow-hidden border'>
            <img
              src={artworkUrl.trim()}
              alt='Preview'
              className='w-full h-full object-cover'
              onError={() => {
                setImageValidation('invalid')
                setImageError('Failed to load image')
              }}
            />
            <button
              type='button'
              onClick={clearArtwork}
              className='absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors'
            >
              <X className='h-3 w-3 text-white' />
            </button>
          </div>
        )}

        {/* URL input */}
        {imageValidation !== 'valid' && (
          <div className='relative'>
            <ImageIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='url'
              placeholder='https://example.com/image.jpg'
              value={artworkUrl}
              onChange={(e) => handleArtworkUrlChange(e.target.value)}
              className={cn(
                'pl-10 pr-10',
                imageValidation === 'invalid' && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            {/* Validation indicator */}
            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
              {imageValidation === 'validating' && (
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              )}
              {imageValidation === 'invalid' && <X className='h-4 w-4 text-destructive' />}
            </div>
          </div>
        )}

        {/* Error message */}
        {imageError && <p className='text-xs text-destructive'>{imageError}</p>}

        {/* Helper text */}
        {imageValidation === 'idle' && !imageError && (
          <p className='text-xs text-muted-foreground'>
            Paste a direct link to an image (JPG, PNG, GIF, WebP)
          </p>
        )}

        {/* Validation success */}
        {imageValidation === 'valid' && (
          <p className='text-xs text-green-600 dark:text-green-400 flex items-center gap-1'>
            <Check className='h-3 w-3' />
            Valid image URL
          </p>
        )}
      </div>

      {/* Lyrics - Line by line inputs */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Text / Lyrics</Label>
          <span
            className={cn(
              'text-xs',
              lines.length >= MAX_CUSTOM_LINES ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {lineCount}/{MAX_CUSTOM_LINES} lines
          </span>
        </div>

        <div className='space-y-2'>
          {lines.map((line, index) => (
            <div key={index} className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground w-4 text-right'>{index + 1}</span>
              <Input
                type='text'
                placeholder={`Line ${index + 1}...`}
                value={line}
                onChange={(e) => updateLine(index, e.target.value)}
                className='flex-1'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={() => removeLine(index)}
                disabled={lines.length <= 1}
                className='text-muted-foreground hover:text-destructive'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>

        {/* Add line button */}
        {lines.length < MAX_CUSTOM_LINES && (
          <Button type='button' variant='outline' size='sm' onClick={addLine} className='w-full'>
            <Plus className='h-4 w-4' />
            Add a line
          </Button>
        )}
      </div>

      {/* Submit */}
      <Button type='submit' disabled={!canSubmit} className='w-full'>
        {imageValidation === 'validating' ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            Validating...
          </>
        ) : (
          <>
            Create my card
            <ChevronRight className='h-4 w-4' />
          </>
        )}
      </Button>
    </form>
  )
}
