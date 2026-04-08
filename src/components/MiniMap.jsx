import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-rotate'
import useCompassHeading from '../hooks/useCompassHeading'

const currentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33], iconAnchor: [10, 33],
})

const nextIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33], iconAnchor: [10, 33],
})

// Circle with upward triangle wedge — leaflet-rotate counter-rotates markers,
// so this static up-wedge always points toward the user's heading on screen.
const gpsIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:32px;height:32px;">
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <!-- heading wedge -->
        <polygon points="16,2 11,14 21,14" fill="#22c55e" opacity="0.9"/>
        <!-- accuracy / GPS dot -->
        <circle cx="16" cy="20" r="7" fill="#22c55e" stroke="white" stroke-width="2"/>
      </svg>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 20],
})

function BearingController({ heading }) {
  const map = useMap()
  useEffect(() => {
    if (heading == null) return
    map.setBearing(360 - heading)
  }, [heading, map])
  return null
}

function Recenter({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true })
  }, [lat, lon, map])
  return null
}

export default function MiniMap({ currentStop, nextStop }) {
  const [gps, setGps] = useState(null)
  const [gpsError, setGpsError] = useState(null)
  const { heading, permissionState, requestPermission } = useCompassHeading()

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('unavailable')
      return
    }

    const onSuccess = pos => {
      setGpsError(null)
      setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy })
    }

    const onErrorFallback = (err) => setGpsError(`${err.code}: ${err.message}`)

    const onError = (err) => {
      if (err.code === 1) {
        setGpsError(`${err.code}: ${err.message}`)
        return
      }
      // Timeout or position unavailable — retry with low accuracy
      navigator.geolocation.watchPosition(onSuccess, onErrorFallback, { enableHighAccuracy: false, timeout: 10000 })
    }

    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
    })
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  if (!currentStop) return null

  const center = [currentStop.lat, currentStop.lon]
  const legLine = nextStop
    ? [[currentStop.lat, currentStop.lon], [nextStop.lat, nextStop.lon]]
    : null

  // Recenter on GPS if available, otherwise on current stop
  const recenterLat = gps ? gps.lat : currentStop.lat
  const recenterLon = gps ? gps.lon : currentStop.lon

  // North indicator rotation: counter-rotate by heading so "N" stays pointing map-north
  const northRotation = heading != null ? heading : 0

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800" style={{ height: 230, position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
        rotate={true}
        bearing={0}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[currentStop.lat, currentStop.lon]} icon={currentIcon} />
        {nextStop && (
          <Marker position={[nextStop.lat, nextStop.lon]} icon={nextIcon} />
        )}
        {legLine && (
          <Polyline positions={legLine} color="#3b82f6" weight={3} />
        )}
        {gps && (
          <>
            <Marker position={[gps.lat, gps.lon]} icon={gpsIcon} />
            {gps.accuracy > 10 && (
              <Circle center={[gps.lat, gps.lon]} radius={gps.accuracy} color="#22c55e" fillColor="#22c55e" fillOpacity={0.1} weight={1} />
            )}
          </>
        )}
        <Recenter lat={recenterLat} lon={recenterLon} />
        <BearingController heading={heading} />
      </MapContainer>

      {/* North indicator — counter-rotated so it always points to map-north */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
          transform: `rotate(${northRotation}deg)`,
          transition: 'transform 0.3s ease',
          background: 'rgba(0,0,0,0.65)',
          color: 'white',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.4,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        N↑
      </div>

      {/* GPS status pill — shown only when there's a problem */}
      {gpsError && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          color: '#f87171',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: 11,
          fontWeight: 600,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          📍 {gpsError}
        </div>
      )}

      {/* Enable Compass button — iOS only, shown until permission granted */}
      {permissionState === 'prompt' && (
        <button
          onClick={requestPermission}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          🧭 Enable Compass
        </button>
      )}
    </div>
  )
}
