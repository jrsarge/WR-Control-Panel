import { useState, useCallback } from 'react'
import route from '../data/route.json'

export function useRoute(initialIndex = 0) {
  const [currentStopIndex, setCurrentStopIndex] = useState(initialIndex)

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
