'use client'

import { useState, useRef } from 'react'
import posthog from 'posthog-js'
import { Image as ImageIcon, Upload, X, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useCardParams } from '@/hooks/use-card-params'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MAX_CUSTOM_LINES,
  MAX_TITLE_LENGTH,
  MAX_ARTIST_LENGTH,
  MAX_IMAGE_UPLOAD_SIZE,
} from '@/lib/constants'

export function CustomCardForm() {
  const { setCustomCard } = useCardParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [artworkUrl, setArtworkUrl] = useState('')
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null)
  const [lines, setLines] = useState<string[]>([''])
  const [imageError, setImageError] = useState<string | null>(null)

  // Filter out empty lines for validation and submission
  const nonEmptyLines = lines.map((line) => line.trim()).filter((line) => line.length > 0)
  const lineCount = nonEmptyLines.length

  // Validation
  const isTitleValid = title.trim().length > 0 && title.length <= MAX_TITLE_LENGTH
  const isArtistValid = artist.trim().length > 0 && artist.length <= MAX_ARTIST_LENGTH
  const isLyricsValid = lineCount >= 1 && lineCount <= MAX_CUSTOM_LINES

  const canSubmit = isTitleValid && isArtistValid && isLyricsValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    posthog.capture('custom_card_created', {
      has_artwork: Boolean(artworkPreview || artworkUrl.trim()),
      artwork_type: artworkPreview?.startsWith('data:') ? 'upload' : artworkUrl.trim() ? 'url' : 'none',
      lines_count: nonEmptyLines.length,
    })

    setCustomCard({
      title: title.trim(),
      artist: artist.trim(),
      artworkUrl: artworkPreview || artworkUrl.trim() || null,
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

  const handleArtworkUrlChange = (url: string) => {
    setArtworkUrl(url)
    setImageError(null)
    // Clear preview if using URL
    if (url.trim()) {
      setArtworkPreview(url.trim())
    } else {
      setArtworkPreview(null)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Le fichier doit être une image')
      return
    }

    // Validate file size
    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      const maxSizeMB = MAX_IMAGE_UPLOAD_SIZE / (1024 * 1024)
      setImageError(`L'image ne doit pas dépasser ${maxSizeMB}MB`)
      return
    }

    setImageError(null)

    // Convert to data URL
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setArtworkPreview(reader.result)
        setArtworkUrl('') // Clear URL input when uploading
      }
    }
    reader.onerror = () => {
      setImageError("Erreur lors du chargement de l'image")
    }
    reader.readAsDataURL(file)
  }

  const clearArtwork = () => {
    setArtworkUrl('')
    setArtworkPreview(null)
    setImageError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title */}
      <div className='space-y-2'>
        <Label htmlFor='title'>Titre</Label>
        <Input
          id='title'
          type='text'
          placeholder='Titre de la chanson ou du livre...'
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
        <Label htmlFor='artist'>Artiste / Auteur</Label>
        <Input
          id='artist'
          type='text'
          placeholder="Nom de l'artiste ou de l'auteur..."
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          maxLength={MAX_ARTIST_LENGTH}
        />
        <p className='text-xs text-muted-foreground text-right'>
          {artist.length}/{MAX_ARTIST_LENGTH}
        </p>
      </div>

      {/* Artwork */}
      <div className='space-y-2'>
        <Label>Illustration (optionnel)</Label>

        {/* Preview */}
        {artworkPreview && (
          <div className='relative w-24 h-24 rounded-lg overflow-hidden border'>
            <img
              src={artworkPreview}
              alt='Aperçu'
              className='w-full h-full object-cover'
              onError={() => {
                setImageError("Impossible de charger l'image")
                setArtworkPreview(null)
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
        {!artworkPreview && (
          <div className='space-y-3'>
            <div className='relative'>
              <ImageIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='url'
                placeholder="URL de l'image..."
                value={artworkUrl}
                onChange={(e) => handleArtworkUrlChange(e.target.value)}
                className='pl-10'
              />
            </div>

            <div className='flex items-center gap-3'>
              <div className='h-px flex-1 bg-border' />
              <span className='text-xs text-muted-foreground'>ou</span>
              <div className='h-px flex-1 bg-border' />
            </div>

            {/* File upload */}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileUpload}
              className='hidden'
            />
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className='h-4 w-4' />
              Importer une image
            </Button>
          </div>
        )}

        {imageError && <p className='text-xs text-destructive'>{imageError}</p>}
      </div>

      {/* Lyrics - Line by line inputs */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Texte / Paroles</Label>
          <span
            className={cn(
              'text-xs',
              lines.length >= MAX_CUSTOM_LINES ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {lineCount}/{MAX_CUSTOM_LINES} lignes
          </span>
        </div>

        <div className='space-y-2'>
          {lines.map((line, index) => (
            <div key={index} className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground w-4 text-right'>{index + 1}</span>
              <Input
                type='text'
                placeholder={`Ligne ${index + 1}...`}
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
            Ajouter une ligne
          </Button>
        )}
      </div>

      {/* Submit */}
      <Button type='submit' disabled={!canSubmit} className='w-full'>
        Créer ma carte
        <ChevronRight className='h-4 w-4' />
      </Button>
    </form>
  )
}
