import { useEffect, useState } from 'react'
import type { AboutContent } from '../../types/models'
import { subscribeAbout } from './aboutRepo'

export function useAbout() {
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 8000)
    const unsubscribe = subscribeAbout(
      (value) => {
        window.clearTimeout(timeout)
        setAbout(value)
        setLoading(false)
        setError(null)
      },
      (snapshotError) => {
        window.clearTimeout(timeout)
        setLoading(false)
        setError(snapshotError.message)
      },
    )
    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  return { about, loading, error }
}
