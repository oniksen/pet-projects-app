import { HashRouter } from 'react-router-dom'
import { ToastProvider } from './app/providers/ToastProvider'
import { AuthProvider } from './app/providers/AuthProvider'
import { AppRoutes } from './app/router'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
