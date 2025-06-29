'use client'

import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void, interval: number) {
  const savedCallback = useRef<() => void>()
  
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  useEffect(() => {
    function tick() {
      savedCallback.current?.()
    }
    
    if (interval !== null) {
      const id = setInterval(tick, interval)
      return () => clearInterval(id)
    }
  }, [interval])
}