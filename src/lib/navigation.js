export function buildNavigationURL(stop) {
  const { lat, lon } = stop
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isIOS) {
    return `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=w`
  } else {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`
  }
}
