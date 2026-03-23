import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

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

const gpsIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#22c55e;border:2px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function Recenter({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true })
  }, [lat, lon, map])
  return null
}

export default function MiniMap({ currentStop, nextStop }) {
  const [gps, setGps] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      pos => setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      null,
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  if (!currentStop) return null

  const center = [currentStop.lat, currentStop.lon]
  const legLine = nextStop
    ? [[currentStop.lat, currentStop.lon], [nextStop.lat, nextStop.lon]]
    : null

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800" style={{ height: 230 }}>
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
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
        <Recenter lat={currentStop.lat} lon={currentStop.lon} />
      </MapContainer>
    </div>
  )
}
