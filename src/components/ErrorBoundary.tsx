import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="config-error">
        <div className="soft-panel config-error-card">
          <span className="hero-label"><span /> ОШИБКА</span>
          <h1>Что-то пошло не так</h1>
          <p>Приложение не смогло загрузиться. Попробуйте обновить страницу.</p>
          <pre className="error-details">{this.state.error.message}</pre>
          <button type="button" className="soft-button new-project" onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      </main>
    )
  }
}
