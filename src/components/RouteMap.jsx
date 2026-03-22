import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import route from '../data/route.json'

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function AutoPan({ currentStop }) {
  const map = useMap()
  const prevStopRef = useRef(null)

  useEffect(() => {
    if (!currentStop) return
    if (prevStopRef.current === currentStop.stop_number) return
    prevStopRef.current = currentStop.stop_number
    map.panTo([currentStop.lat, currentStop.lon], { animate: true, duration: 1 })
  }, [currentStop, map])

  return null
}

export default function RouteMap({ checkIns }) {
  const visitedNumbers = new Set(
    checkIns.filter(c => c.type === 'checkin').map(c => c.stopNumber)
  )
  const skippedNumbers = new Set(
    checkIns.filter(c => c.type === 'skip').map(c => c.stopNumber)
  )

  const lastCheckin = checkIns.filter(c => c.type === 'checkin').at(-1)
  const currentStopNumber = lastCheckin ? lastCheckin.stopNumber + 1 : 1
  const currentStop = route.find(s => s.stop_number === currentStopNumber) ?? route[0]

  const center = [40.615, -111.938]
  const polylinePoints = route.map(s => [s.lat, s.lon])

  function getIcon(stop) {
    if (skippedNumbers.has(stop.stop_number)) return redIcon
    if (visitedNumbers.has(stop.stop_number)) return greenIcon
    if (stop.stop_number === currentStopNumber) return blueIcon
    return greyIcon
  }

  function getCheckinTime(stop) {
    const ci = checkIns.find(c => c.stopNumber === stop.stop_number && c.type === 'checkin')
    return ci ? ci.checkinTimeLocal : null
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      <Polyline positions={polylinePoints} color="#3b82f6" weight={2} opacity={0.6} />

      {route.map(stop => (
        <Marker
          key={stop.stop_number}
          position={[stop.lat, stop.lon]}
          icon={getIcon(stop)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">#{stop.stop_number} {stop.name}</p>
              <p className="text-gray-600">{stop.address}, {stop.city}</p>
              <p className="text-gray-500">Planned: {stop.eta_12}</p>
              {getCheckinTime(stop) && (
                <p className="text-green-700 font-medium">Checked in: {getCheckinTime(stop)}</p>
              )}
              {skippedNumbers.has(stop.stop_number) && (
                <p className="text-red-600 font-medium">SKIPPED</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <AutoPan currentStop={currentStop} />
    </MapContainer>
  )
}
