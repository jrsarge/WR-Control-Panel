import { useState } from 'react'
import { nanoid } from 'nanoid'
import { resumeSessionFromFirestore } from '../hooks/useSession'

export default function Setup({ onStart }) {
  const today = new Date().toISOString().slice(0, 10)
  const [teamName, setTeamName] = useState('')
  const [attemptDate, setAttemptDate] = useState(today)
  const [startTime, setStartTime] = useState('06:00')
  const [sessionId, setSessionId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [wakeError, setWakeError] = useState(false)

  const [showResume, setShowResume] = useState(false)
  const [resumeId, setResumeId] = useState('')
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeError, setResumeError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!teamName.trim()) return
    setConfirming(true)
  }

  async function handleResume(e) {
    e.preventDefault()
    if (!resumeId.trim()) return
    setResumeLoading(true)
    setResumeError('')
    try {
      await resumeSessionFromFirestore(resumeId.trim())
      window.location.reload()
    } catch (err) {
      setResumeError(err.message || 'Failed to load session')
      setResumeLoading(false)
    }
  }

  function handleConfirm() {
    if (!('wakeLock' in navigator)) {
      setWakeError(true)
    }
    onStart({ teamName: teamName.trim(), attemptDate, startTime, sessionId: sessionId.trim() || nanoid(8) })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-400 mb-2">GWR FastTrack</h1>
        <p className="text-gray-400 mb-8 text-sm">Most Fast Food Restaurants Visited in 24 Hours</p>

        {wakeError && (
          <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 text-sm rounded-lg p-3 mb-4">
            ⚠️ Wake Lock not supported on this browser. Your screen may turn off during the attempt.
          </div>
        )}

        {!confirming ? (
          <>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Runner / Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                placeholder="e.g. Team GWR SLC"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Attempt Date
              </label>
              <input
                type="date"
                value={attemptDate}
                onChange={e => setAttemptDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Crew Link Handle
              </label>
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                <span className="text-gray-500 text-sm mr-1">/crew?session=</span>
                <input
                  type="text"
                  value={sessionId}
                  onChange={e => setSessionId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-team-2026"
                  className="bg-transparent text-white text-base focus:outline-none flex-1"
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">Share this link with crew before the attempt</p>
            </div>

            <button
              type="submit"
              disabled={!teamName.trim()}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-lg mt-2 transition-colors"
            >
              Start Attempt →
            </button>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => { setShowResume(r => !r); setResumeError('') }}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors w-full text-center"
            >
              {showResume ? '↑ Cancel' : 'Resume an existing session →'}
            </button>

            {showResume && (
              <form onSubmit={handleResume} className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Session ID</label>
                  <input
                    type="text"
                    value={resumeId}
                    onChange={e => setResumeId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="your-team-2026"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-green-500"
                  />
                </div>
                {resumeError && (
                  <p className="text-red-400 text-sm">{resumeError}</p>
                )}
                <button
                  type="submit"
                  disabled={!resumeId.trim() || resumeLoading}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3 rounded-xl text-base transition-colors"
                >
                  {resumeLoading ? 'Loading…' : 'Resume →'}
                </button>
              </form>
            )}
          </div>
          </>
        ) : (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-2">
              <p className="text-gray-400 text-sm">Team</p>
              <p className="text-xl font-bold">{teamName}</p>
              <p className="text-gray-400 text-sm mt-3">Date</p>
              <p className="text-lg">{attemptDate}</p>
              <p className="text-gray-400 text-sm mt-3">Start Time</p>
              <p className="text-lg">{startTime}</p>
              {sessionId.trim() && (
                <>
                  <p className="text-gray-400 text-sm mt-3">Crew Link</p>
                  <p className="text-green-400 text-sm break-all">
                    {window.location.origin}/crew?session={sessionId.trim()}
                  </p>
                </>
              )}
            </div>

            <p className="text-yellow-400 font-medium text-center">
              Starting the 24-hour window. Are you ready?
            </p>

            <button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              ✓ Yes, Start the Clock
            </button>

            <button
              onClick={() => setConfirming(false)}
              className="w-full bg-transparent border border-gray-700 text-gray-400 font-medium py-3 rounded-xl text-base transition-colors hover:border-gray-500"
            >
              ← Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
