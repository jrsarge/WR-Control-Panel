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
    const SMOOTHING = 0.1
    setHeading(prev => {
      if (prev == null) return h
      let delta = h - prev
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      return (prev + delta * SMOOTHING + 360) % 360
    })
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
