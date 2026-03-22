import { useState, useEffect } from 'react'
import { calcPaceStatus, formatElapsed, formatRemaining } from '../lib/pace'

export function usePace(session, checkIns) {
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
  })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!session) return

    const startDate = new Date(session.startTimestamp)

    const tick = () => {
      const now = new Date()
      const elapsed = Math.floor((now - startDate) / 1000)
      setElapsedSeconds(elapsed)
      setNowMin(now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [session])

  const pace = session
    ? calcPaceStatus(checkIns, session.startMin, nowMin)
    : null

  const elapsed = formatElapsed(elapsedSeconds)
  const remaining = formatRemaining(elapsedSeconds)

  return { pace, elapsed, remaining, elapsedSeconds }
}
