import React from 'react'
import type { Root } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

export function bootstrap(root: Root) {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
