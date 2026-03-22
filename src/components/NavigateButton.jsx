import { buildNavigationURL } from '../lib/navigation'

export default function NavigateButton({ stop }) {
  if (!stop) return null

  function handleClick() {
    const url = buildNavigationURL(stop)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors min-h-[56px]"
    >
      Navigate →
    </button>
  )
}
