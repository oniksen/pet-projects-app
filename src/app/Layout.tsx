import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './providers/AuthProvider'
import { AuthButton } from '../features/auth/AuthButton'
import { InstallPrompt } from '../features/pwa/InstallPrompt'
import { OfflineBanner } from '../features/pwa/OfflineBanner'
import { UpdateToast } from '../features/pwa/UpdateToast'
import { SyncStatus } from '../features/pwa/SyncStatus'

function Header() {
  const { isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const focusSearch = () => {
    navigate('/')
    window.setTimeout(() => document.getElementById('project-search')?.focus(), 80)
  }

  return (
    <header>
      <Link to="/" className="brand">
        <span>av.</span>workspace
      </Link>

      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Проекты
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
          Обо мне
        </NavLink>
        {isAdmin && (
          <NavLink to="/notes" className={({ isActive }) => (isActive ? 'active' : '')}>
            Заметки
          </NavLink>
        )}
      </nav>

      <div className="header-actions">
        <button type="button" className="icon-button soft-button search-jump" aria-label="Поиск по проектам" onClick={focusSearch}>
          <Search size={19} />
        </button>
        <InstallPrompt />
        <AuthButton />
        <button
          type="button"
          className="icon-button soft-button menu"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>
          Проекты
        </NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>
          Обо мне
        </NavLink>
        {isAdmin && (
          <NavLink to="/notes" onClick={() => setMenuOpen(false)}>
            Заметки
          </NavLink>
        )}
        <AuthButton />
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} av.workspace</span>
      <div>
        <span><i /> Готов к работе и новым идеям</span>
        <a href="mailto:hello@example.com">Написать</a>
      </div>
    </footer>
  )
}

export function Layout() {
  return (
    <div className="app-shell">
      <OfflineBanner />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <UpdateToast />
      <SyncStatus />
    </div>
  )
}
