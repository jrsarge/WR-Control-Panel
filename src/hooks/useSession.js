import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'

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
