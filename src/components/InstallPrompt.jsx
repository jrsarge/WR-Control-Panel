import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('gwr_install_dismissed') === 'true'
  )

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  function handleInstall() {
    prompt.prompt()
    prompt.userChoice.then(() => setPrompt(null))
  }

  function handleDismiss() {
    localStorage.setItem('gwr_install_dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-green-900 border-b border-green-700 px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-white text-sm font-medium flex-1">
        Add GWR FastTrack to your home screen for the best experience.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleDismiss}
          className="text-green-300 text-sm px-2 py-1"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="bg-white text-green-900 font-bold text-sm px-3 py-1.5 rounded-lg"
        >
          Install
        </button>
      </div>
    </div>
  )
}
