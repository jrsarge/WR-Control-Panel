import route from '../data/route.json'

function minutesToTimeString(min) {
  if (min == null) return ''
  const h = Math.floor(min / 60) % 24
  const m = Math.floor(min % 60)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

function escapeCSV(val) {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function generateCSV(checkIns, session) {
  const stopMap = Object.fromEntries(route.map(s => [s.stop_number, s]))

  const headers = [
    'Stop#', 'Name', 'Address', 'City', 'State', 'ZIP',
    'Planned_ETA_Local', 'Actual_CheckIn_Local', 'Actual_CheckIn_UTC',
    'GPS_Lat', 'GPS_Lon', 'Delta_Minutes', 'GWR_Borderline', 'Type', 'Notes',
  ]

  const rows = checkIns
    .filter(c => c.type === 'checkin' || c.type === 'skip')
    .map(c => {
      const stop = stopMap[c.stopNumber] ?? {}
      return [
        c.stopNumber,
        c.name,
        c.address,
        c.city,
        c.state,
        c.zip,
        minutesToTimeString(c.plannedEtaMin),
        c.checkinTimeLocal ?? '',
        c.checkinTime ?? '',
        c.gpsLat ?? '',
        c.gpsLon ?? '',
        c.deltaMin != null ? Math.round(c.deltaMin) : '',
        stop.gwr_flag ? 'Y' : 'N',
        c.type,
        c.notes ?? '',
      ].map(escapeCSV).join(',')
    })

  const csv = [headers.join(','), ...rows].join('\n')

  const date = session?.attemptDate ?? new Date().toISOString().slice(0, 10)
  const team = (session?.teamName ?? 'unknown').replace(/\s+/g, '_')
  const filename = `GWR_Evidence_${date}_${team}.csv`

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
