import { useSearchParams } from 'react-router-dom'
import RouteMap from '../components/RouteMap'
import CrewSidebar from '../components/CrewSidebar'
import { useCrewSession } from '../hooks/useCrewSession'
import route from '../data/route.json'

export default function Crew() {
  const [params] = useSearchParams()
  const sessionId = params.get('session')

  const { session, checkIns, loading, error } = useCrewSession(sessionId)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading session…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-950">
      {/* Map — left 2/3 */}
      <div className="flex-1 relative">
        <RouteMap checkIns={checkIns} />
      </div>

      {/* Sidebar — right 1/3 */}
      <div className="w-80 shrink-0 border-l border-gray-800 overflow-hidden">
        <CrewSidebar
          session={session}
          checkIns={checkIns}
          totalStops={route.length}
        />
      </div>
    </div>
  )
}
