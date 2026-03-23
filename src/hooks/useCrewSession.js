import { useState, useEffect } from 'react'
import {
  doc, onSnapshot,
  collection,
  query, orderBy,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'

export function useCrewSession(sessionId) {
  const [session, setSession] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID in URL.')
      setLoading(false)
      return
    }

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Add environment variables to enable the crew dashboard.')
      setLoading(false)
      return
    }

    // Real-time listener on the session doc so it auto-updates when the attempt starts
    const unsubSession = onSnapshot(doc(db, 'sessions', sessionId), snap => {
      if (!snap.exists()) {
        setError('pending')
        setSession(null)
        setLoading(false)
        return
      }
      setSession(snap.data())
      setError(null)
      setLoading(false)
    }, () => {
      setError('Failed to load session.')
      setLoading(false)
    })

    // Real-time listener on checkins subcollection
    const q = query(
      collection(db, 'sessions', sessionId, 'checkins'),
      orderBy('checkinTime', 'asc')
    )

    const unsubCheckIns = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => d.data())
      setCheckIns(docs)
    }, () => {
      // silently ignore snapshot errors
    })

    return () => {
      unsubSession()
      unsubCheckIns()
    }
  }, [sessionId])

  return { session, checkIns, loading, error }
}
