import { QRCodeSVG } from 'qrcode.react'

export default function CrewShareCard({ session }) {
  if (!session) return null

  const crewURL = `${window.location.origin}/crew?session=${session.sessionId}`

  function handleCopy() {
    navigator.clipboard.writeText(crewURL).catch(() => {})
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
      <p className="text-sm font-medium text-gray-300 mb-3">Share with crew</p>
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-xl shrink-0">
          <QRCodeSVG value={crewURL} size={96} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 break-all mb-3">{crewURL}</p>
          <button
            onClick={handleCopy}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )
}
