import { useState, useEffect } from 'react'
import {
  doc, getDoc,
  collection, onSnapshot,
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

    // Load session doc
    getDoc(doc(db, 'sessions', sessionId)).then(snap => {
      if (!snap.exists()) {
        setError('Session not found.')
        setLoading(false)
        return
      }
      setSession(snap.data())
      setLoading(false)
    }).catch(err => {
      setError('Failed to load session.')
      setLoading(false)
    })

    // Real-time listener on checkins subcollection
    const q = query(
      collection(db, 'sessions', sessionId, 'checkins'),
      orderBy('checkinTime', 'asc')
    )

    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => d.data())
      setCheckIns(docs)
    }, () => {
      // silently ignore snapshot errors
    })

    return unsub
  }, [sessionId])

  return { session, checkIns, loading, error }
}
