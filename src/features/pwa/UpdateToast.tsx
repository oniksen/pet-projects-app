import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="update-toast" role="status">
      <RefreshCw size={16} />
      <span>Доступно обновление приложения.</span>
      <button type="button" onClick={() => void updateServiceWorker(true)}>
        Обновить
      </button>
      <button type="button" className="update-dismiss" aria-label="Скрыть" onClick={() => setNeedRefresh(false)}>
        <X size={14} />
      </button>
    </div>
  )
}
