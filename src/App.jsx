import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Setup from './pages/Setup'
import Checklist from './pages/Checklist'
import Runner from './pages/Runner'
import InstallPrompt from './components/InstallPrompt'
import { useSession } from './hooks/useSession'

const Crew = lazy(() => import('./pages/Crew'))

// Flow: setup → checklist → runner
// pendingSession holds the session config between setup and checklist
function RunnerApp() {
  const { session, startSession } = useSession()
  const [pendingSession, setPendingSession] = useState(null)

  // Already have an active session (e.g. page reload mid-run)
  if (session) {
    return <Runner session={session} />
  }

  // Setup complete → show checklist before starting clock
  if (pendingSession) {
    return (
      <Checklist onComplete={() => startSession(pendingSession)} />
    )
  }

  return <Setup onStart={setPendingSession} />
}

export default function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route
          path="/crew"
          element={
            <Suspense fallback={
              <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <p className="text-gray-400">Loading…</p>
              </div>
            }>
              <Crew />
            </Suspense>
          }
        />
        <Route path="*" element={<RunnerApp />} />
      </Routes>
    </BrowserRouter>
  )
}
