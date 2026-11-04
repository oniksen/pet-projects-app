import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  clearIndexedDbPersistence,
  doc,
  getDoc,
  waitForPendingWrites,
} from 'firebase/firestore'
import { auth, configureAuthPersistence, db } from '../../lib/firebase'
import { useToast } from './ToastProvider'

export type AuthStatus = 'checking' | 'idle' | 'admin' | 'denied' | 'offline' | 'error'

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  isAdmin: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  retryAdminCheck: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type OwnerProbeResult = 'owner' | 'denied' | 'offline' | 'error'

async function probeOwner(): Promise<OwnerProbeResult> {
  const probe = getDoc(doc(db, 'meta', 'owner'))
    .then<OwnerProbeResult>(() => 'owner')
    .catch<OwnerProbeResult>((error) => {
      const code = (error as { code?: string }).code
      if (code === 'permission-denied') return 'denied'
      if (code === 'unavailable' || code === 'failed-precondition' || code === 'deadline-exceeded') {
        return 'offline'
      }
      return 'error'
    })

  const timeout = new Promise<OwnerProbeResult>((resolve) => {
    window.setTimeout(() => resolve('offline'), 6000)
  })

  return Promise.race([probe, timeout])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { push } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)
  const deniedRef = useRef(false)

  useEffect(() => {
    configureAuthPersistence().catch(() => {
      // Local persistence may be unavailable in private browsing. The SDK
      // falls back to its default persistence; the app still works.
    })
  }, [])

  useEffect(() => {
    let active = true
    let probeToken = 0

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return
      const token = ++probeToken
      setUser(nextUser)

      if (!nextUser) {
        if (deniedRef.current) {
          deniedRef.current = false
          setStatus('denied')
          setError('Доступ разрешён только владельцу')
          return
        }
        setStatus('idle')
        setError(null)
        return
      }

      setStatus('checking')
      setError(null)
      const result = await probeOwner()
      if (!active || token !== probeToken) return

      if (result === 'owner') {
        setStatus('admin')
        return
      }

      if (result === 'denied') {
        deniedRef.current = true
        setStatus('denied')
        setError('Доступ разрешён только владельцу')
        await firebaseSignOut(auth)
        return
      }

      if (result === 'offline') {
        setStatus('offline')
        setError('Нет сети, чтобы проверить доступ. Показан гостевой режим.')
        return
      }

      setStatus('error')
      setError('Не удалось проверить доступ. Попробуйте ещё раз.')
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const retryAdminCheck = useCallback(async () => {
    if (!user) return
    setStatus('checking')
    setError(null)
    const result = await probeOwner()
    if (result === 'owner') {
      setStatus('admin')
      return
    }
    if (result === 'denied') {
      deniedRef.current = true
      setStatus('denied')
      setError('Доступ разрешён только владельцу')
      await firebaseSignOut(auth)
      return
    }
    if (result === 'offline') {
      setStatus('offline')
      setError('Нет сети, чтобы проверить доступ. Показан гостевой режим.')
      return
    }
    setStatus('error')
    setError('Не удалось проверить доступ. Попробуйте ещё раз.')
  }, [user])

  useEffect(() => {
    if (status !== 'offline' || !user) return
    const onOnline = () => {
      void retryAdminCheck()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [status, user, retryAdminCheck])

  const signIn = useCallback(async (email: string, password: string) => {
    deniedRef.current = false
    setError(null)
    await configureAuthPersistence()
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signOut = useCallback(async () => {
    try {
      await Promise.race([
        waitForPendingWrites(db),
        new Promise((resolve) => window.setTimeout(resolve, 2500)),
      ])
    } catch {
      // Pending writes are still queued; signing out below is still allowed.
    }

    await firebaseSignOut(auth)

    try {
      await clearIndexedDbPersistence(db)
    } catch {
      push('Закройте другие вкладки приложения, чтобы полностью очистить локальный кэш.', 'error')
    }
  }, [push])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAdmin: status === 'admin',
      loading: status === 'checking',
      error,
      signIn,
      signOut,
      retryAdminCheck,
    }),
    [user, status, error, signIn, signOut, retryAdminCheck],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
