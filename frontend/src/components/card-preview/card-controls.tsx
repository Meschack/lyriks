'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { useCardParams } from '@/hooks/use-card-params'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ProModal } from '@/components/shared/pro-modal'
import { CARD_THEMES, CARD_FORMATS } from '@/lib/constants'
import {
  Square,
  RectangleVertical,
  Smartphone,
  Image,
  Type,
  User,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { CardTheme, CardFormat } from '@/types/card'
import { cn } from '@/lib/utils'

const FORMAT_ICONS = {
  square: Square,
  portrait: RectangleVertical,
  story: Smartphone,
} as const

// Font size presets in pixels
const FONT_SIZE_PRESETS = {
  S: 18,
  M: 24,
  L: 36,
} as const

const FONT_SIZE_MIN = 12
const FONT_SIZE_MAX = 48

export function CardControls() {
  const [showProModal, setShowProModal] = useState(false)

  const {
    theme,
    setTheme,
    customColor,
    setCustomColor,
    fontSizePx,
    setFontSizePx,
    format,
    setFormat,
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
  } = useCardParams()

  // Determine which preset is currently active (if any)
  const activePreset = Object.entries(FONT_SIZE_PRESETS).find(
    ([, value]) => value === fontSizePx,
  )?.[0] as keyof typeof FONT_SIZE_PRESETS | undefined

  // Tracked handlers
  const handleThemeChange = (newTheme: CardTheme) => {
    if (newTheme !== theme) {
      posthog.capture('theme_changed', { theme: newTheme })
    }
    setTheme(newTheme)
  }

  const handleFormatChange = (newFormat: CardFormat) => {
    if (newFormat !== format) {
      posthog.capture('format_changed', { format: newFormat })
    }
    setFormat(newFormat)
  }

  return (
    <div className='space-y-6'>
      {/* Theme Swatches */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Ambiance</Label>
        <div className='grid grid-cols-5 gap-2'>
          {Object.entries(CARD_THEMES).map(([key, { name, preview }]) => {
            const isSelected = theme === key
            const isCustom = key === 'custom'
            const isBlur = preview === 'blur'

            return (
              <button
                key={key}
                onClick={() => handleThemeChange(key as CardTheme)}
                className={cn(
                  'group relative aspect-square rounded-lg transition-all overflow-hidden',
                  'ring-2 ring-offset-2 ring-offset-background',
                  isSelected
                    ? 'ring-primary scale-105'
                    : 'ring-transparent hover:ring-muted-foreground/50',
                )}
                title={name}
              >
                <div
                  className='absolute inset-0'
                  style={{
                    background: isCustom
                      ? `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`
                      : isBlur
                        ? 'linear-gradient(135deg, #666 0%, #333 100%)'
                        : preview,
                  }}
                />
                {isBlur && (
                  <div className='absolute inset-0 backdrop-blur-sm flex items-center justify-center'>
                    <span className='text-white text-xs font-medium drop-shadow'>Blur</span>
                  </div>
                )}
                {isCustom && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-white text-xs font-bold drop-shadow'>+</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {theme === 'custom' && (
          <Input
            type='color'
            value={customColor || '#1a1a1a'}
            onChange={(e) => setCustomColor(e.target.value)}
            className='h-10 w-full cursor-pointer rounded-lg'
          />
        )}
      </div>

      {/* Format */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Format</Label>
        <div className='flex gap-2'>
          {Object.entries(CARD_FORMATS).map(([key, { label }]) => {
            const Icon = FORMAT_ICONS[key as keyof typeof FORMAT_ICONS]
            const isSelected = format === key

            return (
              <button
                key={key}
                onClick={() => handleFormatChange(key as CardFormat)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all',
                  'border-2',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/50',
                )}
                title={label}
              >
                <Icon className='h-5 w-5' />
                <span className='text-xs font-medium'>{label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>Taille du texte</Label>
          <span className='text-xs text-muted-foreground font-mono'>{fontSizePx}px</span>
        </div>

        {/* Preset buttons */}
        <div className='flex rounded-lg overflow-hidden border-2 border-muted'>
          {(Object.keys(FONT_SIZE_PRESETS) as Array<keyof typeof FONT_SIZE_PRESETS>).map(
            (preset) => {
              const isSelected = activePreset === preset

              return (
                <button
                  key={preset}
                  onClick={() => setFontSizePx(FONT_SIZE_PRESETS[preset])}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-bold transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted',
                  )}
                >
                  {preset}
                </button>
              )
            },
          )}
        </div>

        {/* Slider for fine-tuning */}
        <Slider
          value={[fontSizePx]}
          onValueChange={([value]) => setFontSizePx(value)}
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
          className='w-full'
        />
      </div>

      {/* Info Position */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Position des infos</Label>
        <div className='flex gap-2'>
          {[
            { value: 'top', icon: ArrowUp, label: 'Haut' },
            { value: 'bottom', icon: ArrowDown, label: 'Bas' },
          ].map(({ value, icon: Icon, label }) => {
            const isSelected = infoPosition === value

            return (
              <button
                key={value}
                onClick={() => setInfoPosition(value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all',
                  'border-2',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/50',
                )}
              >
                <Icon className='h-4 w-4' />
                <span className='text-sm font-medium'>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Display Options */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Affichage</Label>
        <div className='grid grid-cols-2 gap-3'>
          {[
            {
              id: 'artwork',
              icon: Image,
              label: 'Pochette',
              checked: showArtwork,
              onChange: setShowArtwork,
            },
            {
              id: 'title',
              icon: Type,
              label: 'Titre',
              checked: showTitle,
              onChange: setShowTitle,
            },
            {
              id: 'artist',
              icon: User,
              label: 'Artiste',
              checked: showArtist,
              onChange: setShowArtist,
            },
          ].map(({ id, icon: Icon, label, checked, onChange }) => (
            <label
              key={id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                'border-2',
                checked ? 'border-primary/50 bg-primary/5' : 'border-muted bg-muted/30',
              )}
            >
              <Icon className={cn('h-4 w-4', checked ? 'text-primary' : 'text-muted-foreground')} />
              <span
                className={cn(
                  'text-sm font-medium flex-1',
                  checked ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              <Switch id={id} checked={checked} onCheckedChange={onChange} className='scale-90' />
            </label>
          ))}

          {/* Watermark */}
          <label
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
              'border-2 border-primary/50 bg-primary/5',
            )}
          >
            <Sparkles className='h-4 w-4 text-primary' />
            <span className='text-sm font-medium flex-1 text-foreground'>Watermark</span>
            <Switch
              id='watermark'
              checked={showWatermark}
              onCheckedChange={setShowWatermark}
              className='scale-90'
            />
          </label>
        </div>
      </div>

      {/* PRO Modal */}
      <ProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  )
}
