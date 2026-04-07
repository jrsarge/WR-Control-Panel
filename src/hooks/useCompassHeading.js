import { useState, useEffect, useCallback } from 'react'

const isIOS = typeof DeviceOrientationEvent !== 'undefined' &&
  typeof DeviceOrientationEvent.requestPermission === 'function'

export default function useCompassHeading() {
  const [heading, setHeading] = useState(null)
  const [permissionState, setPermissionState] = useState(isIOS ? 'prompt' : 'granted')

  const handleOrientation = useCallback((e) => {
    let h
    if (e.webkitCompassHeading != null) {
      // iOS
      h = e.webkitCompassHeading
    } else if (e.alpha != null) {
      // Android: alpha is counter-clockwise from north
      h = (360 - e.alpha) % 360
    } else {
      return
    }
    setHeading(h)
  }, [])

  useEffect(() => {
    if (permissionState !== 'granted') return
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => window.removeEventListener('deviceorientation', handleOrientation, true)
  }, [permissionState, handleOrientation])

  const requestPermission = useCallback(async () => {
    if (!isIOS) return
    try {
      const result = await DeviceOrientationEvent.requestPermission()
      setPermissionState(result) // 'granted' or 'denied'
    } catch {
      setPermissionState('denied')
    }
  }, [])

  return { heading, permissionState, requestPermission }
}
