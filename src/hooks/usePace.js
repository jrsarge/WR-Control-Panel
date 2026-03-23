import { useState, useEffect } from 'react'
import { calcPaceStatus, formatElapsed, formatRemaining } from '../lib/pace'

export function usePace(session, checkIns) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!session) return
    const startDate = new Date(session.startTimestamp)
    const tick = () => setElapsedSeconds(Math.floor((new Date() - startDate) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [session])

  const pace = session
    ? calcPaceStatus(checkIns, session.startMin, elapsedSeconds)
    : null

  return {
    pace,
    elapsed: formatElapsed(elapsedSeconds),
    remaining: formatRemaining(elapsedSeconds),
    elapsedSeconds,
  }
}
