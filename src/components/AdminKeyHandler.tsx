'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AdminKeyHandler() {
  const router = useRouter()
  const keys = new Set()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase())
      
      if (
        (keys.has('z') && keys.has('x') && keys.has('c')) ||
        (keys.has('я') && keys.has('ч') && keys.has('с'))
      ) {
        router.push('/admin')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return null
} 