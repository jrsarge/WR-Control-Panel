export default function HamburgerRain({ burgers }) {
  if (!burgers.length) return null
  return (
    <>
      <style>{`
        @keyframes burger-fall {
          0%   { transform: translateY(-60px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {burgers.map(b => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: 0,
              fontSize: `${b.size}rem`,
              '--rot': `${b.rotation}deg`,
              animation: `burger-fall ${b.duration}s ease-in forwards`,
            }}
          >
            🍔
          </div>
        ))}
      </div>
    </>
  )
}
