'use client'

import { Search, PenLine } from 'lucide-react'
import { useCardParams, type CardMode } from '@/hooks/use-card-params'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ModeToggle() {
  const { mode, setMode, resetAll } = useCardParams()

  const handleModeChange = (newMode: string) => {
    if (newMode !== mode) {
      // Reset state when switching modes
      resetAll()
      setMode(newMode as CardMode)
    }
  }

  return (
    <Tabs value={mode} onValueChange={handleModeChange} className='w-full'>
      <TabsList className='w-full grid grid-cols-2'>
        <TabsTrigger value='search' className='gap-2'>
          <Search className='h-4 w-4' />
          <span>Rechercher</span>
        </TabsTrigger>
        <TabsTrigger value='custom' className='gap-2'>
          <PenLine className='h-4 w-4' />
          <span>Personnalisé</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
