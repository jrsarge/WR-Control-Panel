import { useState, useCallback, useEffect } from 'react'

const CHECKINS_KEY = 'gwr_checkins'

function loadCheckIns() {
  try {
    const raw = localStorage.getItem(CHECKINS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCheckIns(checkins) {
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins))
}

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState(() => loadCheckIns())

  // Pending sync count — stubs for Firebase (Sprint 2)
  const pendingSync = checkIns.filter(c => !c.synced).length

  const addCheckIn = useCallback((record) => {
    setCheckIns(prev => {
      const updated = [...prev, record]
      saveCheckIns(updated)
      return updated
    })
  }, [])

  const removeLastCheckIn = useCallback(() => {
    setCheckIns(prev => {
      if (prev.length === 0) return prev
      const updated = prev.slice(0, -1)
      saveCheckIns(updated)
      return updated
    })
  }, [])

  const completedCount = checkIns.filter(c => c.type === 'checkin').length

  return { checkIns, addCheckIn, removeLastCheckIn, pendingSync, completedCount }
}
