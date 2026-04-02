export default function CurrentStopCard({ stop, totalStops }) {
  if (!stop) return null

  const legTime = stop.leg_time_min > 0
    ? `~${Math.round(stop.leg_time_min)} min`
    : null

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      {/* Stop number + GWR flag */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400 font-medium">
          Stop {stop.stop_number} / {totalStops}
        </span>
        {stop.gwr_flag && (
          <span className="bg-yellow-900 border border-yellow-600 text-yellow-300 text-xs font-bold px-2 py-1 rounded-lg">
            ⚠️ GWR BORDERLINE
          </span>
        )}
      </div>

      {/* Restaurant name */}
      <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{stop.name}</h2>

      {/* Address */}
      <p className="text-gray-300 text-base mb-4">
        {stop.address}, {stop.city}
      </p>

      {/* Details row */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Planned ETA</p>
          <p className="text-white font-semibold">{stop.eta_12}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Hours</p>
          <p className="text-white font-semibold text-xs leading-tight">{stop.hours_display}</p>
        </div>
        {stop.leg_distance_miles > 0 && (
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Distance</p>
            <p className="text-white font-semibold">{stop.leg_distance_miles} mi</p>
          </div>
        )}
        {legTime && (
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Travel Time</p>
            <p className="text-white font-semibold">{legTime}</p>
          </div>
        )}
      </div>

      {stop.cheapest_item && (
        <div className="bg-gray-800 rounded-lg p-3 mt-3">
          <p className="text-gray-500 text-xs mb-1">Order</p>
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">{stop.cheapest_item}</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">
                ${stop.cheapest_price?.toFixed(2)}
              </p>
              {stop.cheapest_is_drink && (
                <span title="Ask for a drink">🥤</span>
              )}
            </div>
          </div>
        </div>
      )}

      {stop.is_post_midnight && (
        <div className="mt-3 text-xs text-blue-400 font-medium">
          🌙 Post-midnight stop (24/7)
        </div>
      )}
    </div>
  )
}
