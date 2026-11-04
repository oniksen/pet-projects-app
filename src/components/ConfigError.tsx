import type { RequiredEnvKey } from '../lib/env'

export function ConfigError({ missing }: { missing: RequiredEnvKey[] }) {
  return (
    <main className="config-error">
      <div className="soft-panel config-error-card">
        <span className="hero-label"><span /> НАСТРОЙКА</span>
        <h1>Не хватает переменных окружения</h1>
        <p>Добавьте значения в <code>.env.local</code> (локально) или в GitHub Variables (для деплоя):</p>
        <ul>
          {missing.map((key) => (
            <li key={key}><code>{key}</code></li>
          ))}
        </ul>
        <p className="muted">После изменения перезапустите dev-сервер.</p>
      </div>
    </main>
  )
}
