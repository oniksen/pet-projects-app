import { sendPasswordResetEmail } from 'firebase/auth'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import { useToast } from '../../app/providers/ToastProvider'
import { SoftButton, Spinner } from '../../components/ui'
import { auth } from '../../lib/firebase'

function loginErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return 'Неверный email или пароль.'
  }
  if (code === 'auth/too-many-requests') return 'Слишком много попыток. Попробуйте позже.'
  if (code === 'auth/network-request-failed') return 'Нет сети. Проверьте подключение.'
  if (code === 'auth/user-disabled') return 'Этот аккаунт отключён.'
  return 'Не удалось войти. Попробуйте ещё раз.'
}

export function LoginPage() {
  const { status, isAdmin, error, signIn } = useAuth()
  const { push } = useToast()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (isAdmin) return <Navigate to={from} replace />

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!email.trim() || !password) {
      setFormError('Заполните email и пароль.')
      return
    }
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch (error) {
      setFormError(loginErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const onReset = async () => {
    if (!email.trim()) {
      setFormError('Сначала укажите email.')
      return
    }
    setResetBusy(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      push('Письмо для сброса пароля отправлено.', 'success')
    } catch (error) {
      setFormError(loginErrorMessage(error))
    } finally {
      setResetBusy(false)
    }
  }

  const busy = submitting || status === 'checking'

  return (
    <div className="login-page">
      <section className="login-card soft-panel">
        <Link to="/" className="login-back">
          <ArrowLeft size={14} /> На главную
        </Link>
        <div className="hero-label"><span /> ВХОД ВЛАДЕЛЬЦА</div>
        <h1>Только для <em>владельца.</em></h1>
        <p className="login-copy">
          Публичные проекты открыты всем. Управление проектами, этапами и заметками доступно
          только владельцу аккаунта.
        </p>

        {(error || formError) && (
          <div className="form-error" role="alert">
            <LockKeyhole size={15} /> {formError ?? error}
          </div>
        )}

        {status === 'offline' && (
          <div className="form-warning" role="status">
            Нет сети для проверки доступа. Проверьте подключение и попробуйте снова.
          </div>
        )}

        <form className="login-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="username"
              inputMode="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Пароль</span>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          <SoftButton className="save-button login-submit" type="submit" disabled={busy}>
            {busy ? <Spinner label="Входим" /> : <LockKeyhole size={16} />}
            {busy ? 'Проверяем доступ…' : 'Войти'}
          </SoftButton>
        </form>

        <button type="button" className="text-button login-reset" onClick={onReset} disabled={resetBusy}>
          {resetBusy ? 'Отправляем…' : 'Забыли пароль?'}
        </button>

        <p className="login-note">Регистрации нет. Аккаунт создаётся вручную в Firebase Console.</p>
      </section>
    </div>
  )
}
