import { useState, useCallback, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import route from '../data/route.json'

const ROUTE_INDEX_KEY = 'gwr_route_index'

export function useRoute(sessionId) {
  const [currentStopIndex, setCurrentStopIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(ROUTE_INDEX_KEY)
      const parsed = saved !== null ? parseInt(saved, 10) : 0
      return isNaN(parsed) ? 0 : Math.min(parsed, route.length - 1)
    } catch {
      return 0
    }
  })

  useEffect(() => {
    localStorage.setItem(ROUTE_INDEX_KEY, currentStopIndex)
    if (sessionId && isFirebaseConfigured) {
      setDoc(doc(db, 'sessions', sessionId), { routeIndex: currentStopIndex }, { merge: true }).catch(() => {})
    }
  }, [currentStopIndex, sessionId])

  const stops = route
  const currentStop = stops[currentStopIndex] ?? null
  const nextStops = stops.slice(currentStopIndex + 1, currentStopIndex + 3)

  const advance = useCallback(() => {
    setCurrentStopIndex(i => Math.min(i + 1, stops.length - 1))
  }, [stops.length])

  const goBack = useCallback(() => {
    setCurrentStopIndex(i => Math.max(i - 1, 0))
  }, [])

  const goTo = useCallback((index) => {
    setCurrentStopIndex(Math.max(0, Math.min(index, stops.length - 1)))
  }, [stops.length])

  return { stops, currentStop, currentStopIndex, nextStops, advance, goBack, goTo }
}
