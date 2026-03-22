import { useState, useEffect } from 'react'
import Setup from './pages/Setup'
import Runner from './pages/Runner'
import { useSession } from './hooks/useSession'

export default function App() {
  const { session, startSession } = useSession()

  const [dark, setDark] = useState(() => {
    return localStorage.getItem('gwr_dark') !== 'false'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('gwr_dark', dark)
  }, [dark])

  const toggleDark = () => setDark(d => !d)

  if (!session) {
    return <Setup onStart={startSession} />
  }

  return <Runner session={session} onToggleDark={toggleDark} />
}
