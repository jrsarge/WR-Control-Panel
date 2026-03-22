export default function UpcomingStops({ stops }) {
  if (!stops || stops.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-1">
        Up Next
      </p>
      <div className="space-y-2">
        {stops.map((stop) => (
          <div
            key={stop.stop_number}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <span className="text-gray-500 text-xs font-bold w-8 shrink-0">
              #{stop.stop_number}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{stop.name}</p>
              <p className="text-gray-500 text-xs">{stop.city}</p>
            </div>
            <span className="text-gray-400 text-xs shrink-0">
              {stop.leg_distance_miles > 0 ? `${stop.leg_distance_miles} mi` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
