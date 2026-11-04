import { useEffect, useState } from 'react'
import type { Project, Stage } from '../../types/models'
import { useAuth } from '../../app/providers/AuthProvider'
import { subscribeProject, subscribeProjects, subscribeStages } from './projectsRepo'

export function useProjects() {
  const { isAdmin, status } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'checking') return
    setLoading(true)
    const timeout = window.setTimeout(() => {
      setLoading(false)
      setError((current) => current ?? 'Не удалось подключиться к Firestore. Проверьте, что база создана и правила задеплоены.')
    }, 8000)
    const unsubscribe = subscribeProjects(
      isAdmin,
      (items) => {
        window.clearTimeout(timeout)
        setProjects(items)
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
  }, [isAdmin, status])

  return { projects, loading, error }
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setNotFound(false)
    setError(null)
    const timeout = window.setTimeout(() => {
      setLoading(false)
      setError((current) => current ?? 'Не удалось подключиться к Firestore. Проверьте, что база создана и правила задеплоены.')
    }, 8000)

    const unsubscribe = subscribeProject(
      projectId,
      (item) => {
        window.clearTimeout(timeout)
        setProject(item)
        setLoading(false)
        setNotFound(item === null)
      },
      (snapshotError) => {
        window.clearTimeout(timeout)
        setLoading(false)
        setProject(null)
        const code = (snapshotError as { code?: string }).code
        if (code === 'permission-denied' || code === 'not-found') {
          setNotFound(true)
          return
        }
        setError(snapshotError.message)
      },
    )

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [projectId])

  return { project, loading, notFound, error }
}

export function useStages(projectId: string | undefined) {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setStages([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = window.setTimeout(() => setLoading(false), 8000)
    const unsubscribe = subscribeStages(
      projectId,
      (items) => {
        window.clearTimeout(timeout)
        setStages(items)
        setLoading(false)
      },
      () => {
        window.clearTimeout(timeout)
        setStages([])
        setLoading(false)
      },
    )
    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [projectId])

  return { stages, loading }
}
