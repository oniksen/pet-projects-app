import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!promptEvent) return null

  return (
    <button
      type="button"
      className="icon-button soft-button install-button"
      aria-label="Установить приложение"
      title="Установить приложение"
      onClick={async () => {
        await promptEvent.prompt()
        await promptEvent.userChoice
        setPromptEvent(null)
      }}
    >
      <Download size={18} />
    </button>
  )
}
