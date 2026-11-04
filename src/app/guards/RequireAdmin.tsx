import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { LoadingPage } from '../../components/ui'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, isAdmin } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <LoadingPage text="Проверяем доступ…" />
  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
