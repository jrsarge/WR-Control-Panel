import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Setup from './pages/Setup'
import Runner from './pages/Runner'
import Crew from './pages/Crew'
import InstallPrompt from './components/InstallPrompt'
import { useSession } from './hooks/useSession'

function RunnerApp() {
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

export default function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route path="/crew" element={<Crew />} />
        <Route path="*" element={<RunnerApp />} />
      </Routes>
    </BrowserRouter>
  )
}
