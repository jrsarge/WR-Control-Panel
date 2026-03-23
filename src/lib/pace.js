import route from '../data/route.json'

export function plannedStopsAtElapsed(elapsedMinutes, startMin = 360) {
  const currentMin = startMin + elapsedMinutes
  return route.filter(s => s.arrival_min <= currentMin).length
}

export function calcPaceStatus(checkIns, sessionStartMin, elapsedSeconds) {
  const elapsedMin = elapsedSeconds / 60
  if (elapsedMin <= 0) return { status: 'ON_PACE', projected: 171, ratio: 1, actualCount: 0, plannedCount: 0, stopsPerHour: 0, deltaMin: 0 }

  const actualCount = checkIns.filter(c => c.type === 'checkin').length
  const plannedCount = plannedStopsAtElapsed(elapsedMin, sessionStartMin)

  const ratio = plannedCount > 0 ? actualCount / plannedCount : 1
  const stopsPerHour = (actualCount / elapsedMin) * 60
  const remainingMin = (86400 - elapsedSeconds) / 60
  const projected = Math.round(actualCount + stopsPerHour * (remainingMin / 60))

  const lastCheckin = checkIns.filter(c => c.type === 'checkin').at(-1)

  return {
    status: ratio > 1.05 ? 'AHEAD' : ratio < 0.95 ? 'BEHIND' : 'ON_PACE',
    ratio,
    actualCount,
    plannedCount,
    stopsPerHour: Math.round(stopsPerHour * 10) / 10,
    projected: Math.max(0, projected),
    deltaMin: lastCheckin?.deltaMin ?? 0,
  }
}

export function formatElapsed(elapsedSeconds) {
  const h = Math.floor(elapsedSeconds / 3600)
  const m = Math.floor((elapsedSeconds % 3600) / 60)
  const s = elapsedSeconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export function formatRemaining(elapsedSeconds, totalSeconds = 86400) {
  const rem = Math.max(0, totalSeconds - elapsedSeconds)
  return formatElapsed(rem)
}
