import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="inner-page not-found-page">
      <div className="soft-panel not-found-card">
        <SearchX size={30} />
        <span className="section-index">404</span>
        <h1>Страница не найдена</h1>
        <p>Возможно, проект удалён или у вас нет доступа к этой странице.</p>
        <Link to="/" className="soft-button new-project">
          <ArrowLeft size={16} /> К проектам
        </Link>
      </div>
    </div>
  )
}
