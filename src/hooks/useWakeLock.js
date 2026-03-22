import { useEffect, useRef } from 'react'

export function useWakeLock(active) {
  const lockRef = useRef(null)

  async function acquire() {
    if (!('wakeLock' in navigator)) return
    try {
      lockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // silently fail
    }
  }

  async function release() {
    if (lockRef.current) {
      await lockRef.current.release()
      lockRef.current = null
    }
  }

  useEffect(() => {
    if (!active) return

    acquire()

    // Re-acquire when tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      release()
    }
  }, [active])
}
