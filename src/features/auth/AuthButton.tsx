import { LogOut, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import { useToast } from '../../app/providers/ToastProvider'
import { SoftButton, Spinner } from '../../components/ui'

export function AuthButton() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const { push } = useToast()

  if (loading) {
    return (
      <span className="auth-button auth-loading">
        <Spinner label="Проверяем вход" />
      </span>
    )
  }

  if (isAdmin && user) {
    return (
      <div className="auth-user">
        <span className="auth-avatar" title={user.email ?? 'Владелец'}>
          <UserRound size={15} />
        </span>
        <SoftButton
          className="auth-button ghost"
          label="Выйти"
          onClick={() => {
            void signOut().catch(() => push('Не удалось выйти. Попробуйте ещё раз.', 'error'))
          }}
        >
          <LogOut size={14} /> Выйти
        </SoftButton>
      </div>
    )
  }

  return (
    <Link to="/login" className="soft-button auth-button">
      <UserRound size={15} /> Войти
    </Link>
  )
}
