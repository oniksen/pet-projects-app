import { useEffect, useState } from 'react'
import type { Note } from '../../types/models'
import { useAuth } from '../../app/providers/AuthProvider'
import { subscribeNotes } from '../projects/projectsRepo'

export function useNotes(projectId: string | null = null) {
  const { isAdmin, status } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin || status === 'checking') {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = window.setTimeout(() => setLoading(false), 8000)
    const unsubscribe = subscribeNotes(
      projectId,
      (items) => {
        window.clearTimeout(timeout)
        setNotes(items)
        setLoading(false)
      },
      () => {
        window.clearTimeout(timeout)
        setNotes([])
        setLoading(false)
      },
    )
    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [isAdmin, status, projectId])

  return { notes, loading }
}
