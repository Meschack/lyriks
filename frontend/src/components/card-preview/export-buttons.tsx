'use client'

import { useState } from 'react'
import { Download, Link, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonsProps {
  onExportPng: () => Promise<void>
  onExportJpg: () => Promise<void>
  shareUrl: string
  disabled: boolean
  isExporting: boolean
}

export function ExportButtons({
  onExportPng,
  onExportJpg,
  shareUrl,
  disabled,
  isExporting,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className='space-y-3'>
      {/* Export buttons */}
      <div className='grid grid-cols-2 gap-2'>
        <Button
          onClick={onExportPng}
          disabled={disabled || isExporting}
          size='sm'
          className='w-full'
        >
          {isExporting ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Download className='h-4 w-4 mr-2' />
          )}
          PNG
        </Button>
        <Button
          onClick={onExportJpg}
          disabled={disabled || isExporting}
          variant='secondary'
          size='sm'
          className='w-full'
        >
          {isExporting ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Download className='h-4 w-4 mr-2' />
          )}
          JPG
        </Button>
      </div>

      {/* Copy link */}
      <Button
        onClick={handleCopyLink}
        disabled={disabled}
        variant='ghost'
        size='sm'
        className='w-full'
      >
        {copied ? (
          <>
            <Check className='h-4 w-4 mr-2' />
            Lien copié!
          </>
        ) : (
          <>
            <Link className='h-4 w-4 mr-2' />
            Copier le lien
          </>
        )}
      </Button>
    </div>
  )
}
