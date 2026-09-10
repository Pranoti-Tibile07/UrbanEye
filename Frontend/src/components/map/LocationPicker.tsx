import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const PUNE_CENTER: [number, number] = [18.5204, 73.8567]

const pickIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#14b8a6;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
})

export interface LatLng {
  lat: number
  lng: number
}

function ClickCatcher({ onPick }: { onPick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

function MapController({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  return null
}

export default function LocationPicker({
  value,
  onChange,
  height = '320px',
}: {
  value: LatLng | null
  onChange: (latlng: LatLng) => void
  height?: string
}) {
  const [map, setMap] = useState<L.Map | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  function detectLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        onChange(latlng)
        map?.setView([latlng.lat, latlng.lng], 16)
        setLocating(false)
      },
      () => {
        setGeoError('Location permission denied. Click the map or enter coordinates manually.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div>
      <div style={{ height }} className="relative overflow-hidden rounded-xl border border-slate-300">
        <MapContainer
          center={value ? [value.lat, value.lng] : PUNE_CENTER}
          zoom={value ? 16 : 13}
          scrollWheelZoom
          className="urbaneye-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={onChange} />
          <MapController onReady={setMap} />
          {value && <Marker position={[value.lat, value.lng]} icon={pickIcon} />}
        </MapContainer>

        <div className="absolute top-3 left-3 z-[500]">
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy-950 shadow-md hover:bg-slate-50 disabled:opacity-60"
          >
            {locating ? 'Locating…' : '📍 Use my location'}
          </button>
        </div>
      </div>

      {geoError && <p className="mt-1.5 text-xs text-amber-600">{geoError}</p>}
      <p className="mt-1.5 text-xs text-slate-500">
        {value
          ? `Selected: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
          : 'Click the map to pin the issue location (optional).'}
      </p>
    </div>
  )
}
