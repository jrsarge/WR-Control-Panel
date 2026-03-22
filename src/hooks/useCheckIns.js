import { useState, useCallback } from 'react'
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'

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

async function syncToFirestore(sessionId, record) {
  if (!isFirebaseConfigured || !sessionId) return
  try {
    const ref = doc(collection(db, 'sessions', sessionId, 'checkins'), record.id)
    await setDoc(ref, { ...record, synced: true, createdAt: serverTimestamp() })
  } catch {
    // localStorage is source of truth — Firestore failure is non-blocking
  }
}

async function syncSession(sessionId, session) {
  if (!isFirebaseConfigured || !sessionId) return
  try {
    const ref = doc(db, 'sessions', sessionId)
    await setDoc(ref, { ...session, createdAt: serverTimestamp() }, { merge: true })
  } catch {
    // silent
  }
}

export function useCheckIns(sessionId) {
  const [checkIns, setCheckIns] = useState(() => loadCheckIns())

  const pendingSync = checkIns.filter(c => !c.synced).length

  const addCheckIn = useCallback((record) => {
    setCheckIns(prev => {
      const updated = [...prev, record]
      saveCheckIns(updated)
      return updated
    })

    // Fire-and-forget sync to Firestore
    syncToFirestore(sessionId, record).then(() => {
      // Mark synced in localStorage
      setCheckIns(prev => {
        const updated = prev.map(c => c.id === record.id ? { ...c, synced: true } : c)
        saveCheckIns(updated)
        return updated
      })
    })
  }, [sessionId])

  const removeLastCheckIn = useCallback(() => {
    setCheckIns(prev => {
      if (prev.length === 0) return prev
      const updated = prev.slice(0, -1)
      saveCheckIns(updated)
      return updated
    })
  }, [])

  const completedCount = checkIns.filter(c => c.type === 'checkin').length

  return { checkIns, addCheckIn, removeLastCheckIn, pendingSync, completedCount, syncSession }
}

export { syncSession }
