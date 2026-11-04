import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { onSnapshotsInSync } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export function SyncStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = onSnapshotsInSync(db, () => {
      setSyncing(false)
      if (timer.current) window.clearTimeout(timer.current)
    })

    const onWrite = () => {
      setSyncing(true)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setSyncing(false), 4000)
    }

    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener('workspace:write', onWrite)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      unsubscribe()
      window.removeEventListener('workspace:write', onWrite)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  if (!online) {
    return (
      <div className="sync-badge sync-offline" role="status">
        <CloudOff size={14} /> Офлайн
      </div>
    )
  }

  return (
    <div className={`sync-badge ${syncing ? 'sync-active' : ''}`} role="status">
      {syncing ? <RefreshCw size={14} className="spin" /> : <Cloud size={14} />}
      {syncing ? 'Синхронизация…' : 'Синхронизировано'}
    </div>
  )
}
