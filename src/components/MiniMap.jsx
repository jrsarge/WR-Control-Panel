import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
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

function Recenter({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true })
  }, [lat, lon, map])
  return null
}

export default function MiniMap({ currentStop, nextStop }) {
  if (!currentStop) return null

  const center = [currentStop.lat, currentStop.lon]
  const legLine = nextStop
    ? [[currentStop.lat, currentStop.lon], [nextStop.lat, nextStop.lon]]
    : null

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800" style={{ height: 150 }}>
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
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
        <Recenter lat={currentStop.lat} lon={currentStop.lon} />
      </MapContainer>
    </div>
  )
}
