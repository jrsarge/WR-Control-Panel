import { useState } from 'react'

const ITEMS = [
  { id: 'battery',   label: 'Phone fully charged' },
  { id: 'wakelock',  label: 'Wake Lock confirmed working (screen stays on)' },
  { id: 'nav',       label: 'Navigation tested — tapped "Navigate" on stop #1' },
  { id: 'crew',      label: 'Crew dashboard open on coordinator device' },
  { id: 'witnesses', label: 'GWR witnesses present and briefed' },
  { id: 'gps',       label: 'GPS permissions granted' },
]

export default function Checklist({ onComplete }) {
  const [checked, setChecked] = useState({})
  const [skipping, setSkipping] = useState(false)

  const allChecked = ITEMS.every(item => checked[item.id])

  function toggle(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-1">Pre-Attempt Checklist</h1>
        <p className="text-gray-400 text-sm mb-6">Check all items before starting the clock.</p>

        <div className="space-y-3 mb-8">
          {ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-colors
                ${checked[item.id]
                  ? 'bg-green-950 border-green-700 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-300'
                }`}
            >
              <span className={`text-xl shrink-0 ${checked[item.id] ? 'text-green-400' : 'text-gray-600'}`}>
                {checked[item.id] ? '✓' : '○'}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onComplete}
          disabled={!allChecked}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
        >
          Start Attempt →
        </button>

        {!allChecked && (
          <p className="text-gray-600 text-xs text-center mt-3">
            Check all items above to continue.{' '}
            <button
              onClick={() => onComplete()}
              className="text-gray-500 underline"
            >
              Skip checklist
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
