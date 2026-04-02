import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { doc, getDoc, getDocs, setDoc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import route from '../data/route.json'

const SESSION_KEY = 'gwr_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function useSession() {
  const [session, setSession] = useState(() => {
    const existing = loadSession()
    // If a session exists in localStorage but Firebase is now working,
    // re-sync it to Firestore in case it was missed during a previous failure
    if (existing && isFirebaseConfigured) {
      setDoc(doc(db, 'sessions', existing.sessionId), {
        ...existing,
        createdAt: serverTimestamp(),
      }, { merge: true }).catch(() => {})
    }
    return existing
  })

  const startSession = useCallback(({ teamName, attemptDate, startTime, sessionId: existingId }) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMin = hours * 60 + minutes

    const newSession = {
      sessionId: existingId || nanoid(8),
      teamName,
      attemptDate,
      startTime,
      startTimestamp: new Date().toISOString(),
      startMin,
    }

    saveSession(newSession)
    setSession(newSession)

    // Sync session doc to Firestore (non-blocking)
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'sessions', newSession.sessionId), {
        ...newSession,
        createdAt: serverTimestamp(),
      }, { merge: true }).catch(() => {})
    }

    return newSession
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  return { session, startSession, clearSession }
}

export async function resumeSessionFromFirestore(sessionId) {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured')

  const sessionSnap = await getDoc(doc(db, 'sessions', sessionId))
  if (!sessionSnap.exists()) throw new Error('Session not found')

  // Restore session metadata (strip Firestore-only fields)
  const { createdAt: _createdAt, ...sessionData } = sessionSnap.data()
  localStorage.setItem('gwr_session', JSON.stringify(sessionData))

  // Restore check-ins
  const checkinsSnap = await getDocs(
    query(collection(db, 'sessions', sessionId, 'checkins'), orderBy('checkinTime', 'asc'))
  )
  const checkins = checkinsSnap.docs.map(d => ({ ...d.data(), synced: true }))
  localStorage.setItem('gwr_checkins', JSON.stringify(checkins))

  // Restore route index
  let routeIndex = 0
  if (sessionData.routeIndex != null) {
    routeIndex = sessionData.routeIndex
  } else if (checkins.length > 0) {
    const stopNumbers = checkins.map(c => c.stopNumber).filter(n => n != null)
    if (stopNumbers.length > 0) {
      const maxStopNumber = Math.max(...stopNumbers)
      const idx = route.findIndex(s => s.stop_number === maxStopNumber)
      routeIndex = idx >= 0 ? idx + 1 : maxStopNumber
    }
  }
  localStorage.setItem('gwr_route_index', routeIndex)
}
