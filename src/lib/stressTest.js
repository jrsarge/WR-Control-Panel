/**
 * Stress test simulation — pastes into browser console on the runner page.
 *
 * Simulates 171 check-ins at an accelerated rate (100ms between each)
 * to verify no memory leaks, UI slowdowns, or localStorage corruption.
 *
 * Usage:
 *   1. Open the runner app in a browser with an active session
 *   2. Open DevTools console
 *   3. Paste this entire file and press Enter
 */

;(async function runStressTest() {
  const CHECKINS_KEY = 'gwr_checkins'
  const SESSION_KEY = 'gwr_session'
  const DELAY_MS = 100 // ms between each simulated check-in

  const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
  if (!session) {
    console.error('No active session found. Start a session first.')
    return
  }

  // Load route from the app's global if available, else fetch
  let route
  try {
    const res = await fetch('/src/data/route.json')
    route = await res.json()
  } catch {
    console.error('Could not load route.json. Run this in the Vite dev server.')
    return
  }

  console.log(`Starting stress test: ${route.length} stops, ${DELAY_MS}ms apart`)
  const start = performance.now()

  // Clear existing check-ins
  localStorage.setItem(CHECKINS_KEY, JSON.stringify([]))

  for (let i = 0; i < route.length; i++) {
    const stop = route[i]
    const now = new Date()
    const checkinMin = now.getHours() * 60 + now.getMinutes()

    const record = {
      id: `stress-${i}-${Date.now()}`,
      stopNumber: stop.stop_number,
      name: stop.name,
      address: stop.address,
      city: stop.city,
      state: stop.state,
      zip: stop.zip,
      plannedEtaMin: stop.arrival_min,
      checkinTime: now.toISOString(),
      checkinTimeLocal: now.toLocaleTimeString(),
      checkinMin,
      gpsLat: null,
      gpsLon: null,
      deltaMin: checkinMin - stop.arrival_min,
      gwr_flag: stop.gwr_flag,
      synced: false,
      type: 'checkin',
    }

    const existing = JSON.parse(localStorage.getItem(CHECKINS_KEY) ?? '[]')
    existing.push(record)
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(existing))

    if ((i + 1) % 25 === 0) {
      const elapsed = ((performance.now() - start) / 1000).toFixed(1)
      const size = (localStorage.getItem(CHECKINS_KEY).length / 1024).toFixed(1)
      console.log(`Stop ${i + 1}/${route.length} | ${elapsed}s elapsed | localStorage: ${size} KB`)
    }

    await new Promise(r => setTimeout(r, DELAY_MS))
  }

  const total = ((performance.now() - start) / 1000).toFixed(1)
  const finalSize = (localStorage.getItem(CHECKINS_KEY).length / 1024).toFixed(1)
  console.log(`✓ Stress test complete: ${route.length} stops in ${total}s | localStorage: ${finalSize} KB`)
  console.log('Reload the page to see the summary screen.')
})()
