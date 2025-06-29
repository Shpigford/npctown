'use client'

import { useEffect } from 'react'
import { useWorldClock } from '@/lib/hooks/useWorldClock'

export default function WorldClock() {
  useEffect(() => {
    console.log('[WorldClock Component] Mounted and initializing world clock')
    return () => {
      console.log('[WorldClock Component] Unmounting')
    }
  }, [])
  
  useWorldClock()
  return null
}