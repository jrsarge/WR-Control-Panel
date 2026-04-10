import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Setup from './pages/Setup'
import Runner from './pages/Runner'
import InstallPrompt from './components/InstallPrompt'
import { useSession } from './hooks/useSession'

const Crew = lazy(() => import('./pages/Crew'))

function RunnerApp() {
  const { session, startSession } = useSession()

  if (session) {
    return <Runner session={session} />
  }

  return <Setup onStart={startSession} />
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
        <Route path="/run" element={<RunnerApp />} />
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  )
}
