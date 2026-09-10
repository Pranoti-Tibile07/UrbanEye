import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'

import { CATEGORY_STYLES } from '../../lib/constants'
import type { Category, Report } from '../../types'

function markerIcon(category: Category) {
  const color = CATEGORY_STYLES[category].marker
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  })
}

export default function ReportMap({
  reports,
  height = '420px',
}: {
  reports: Report[]
  height?: string
}) {
  const positioned = reports.filter(
    (r) => r.latitude !== null && r.longitude !== null,
  )

  if (positioned.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
      >
        No reports with location data to display.
      </div>
    )
  }

  const center: [number, number] = [
    positioned[0].latitude as number,
    positioned[0].longitude as number,
  ]

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="urbaneye-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positioned.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude as number, report.longitude as number]}
            icon={markerIcon(report.category)}
          >
            <Popup>
              <div className="w-52">
                <p className="text-sm font-semibold text-slate-900">{report.category}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {report.severity} · {report.status}
                </p>
                {report.address && (
                  <p className="mt-1 text-xs text-slate-600">{report.address}</p>
                )}
                <Link
                  to={`/reports/${report.id}`}
                  className="mt-2 inline-block text-xs font-semibold text-teal-600 hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
