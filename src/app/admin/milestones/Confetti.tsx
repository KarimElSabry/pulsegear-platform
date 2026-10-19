// src/app/admin/milestones/Confetti.tsx
// Pure CSS confetti for the celebration. Positions are derived from the index so server and browser render the same.

'use client'

const COLORS = ['#a855f7', '#ec4899', '#f97316', '#facc15', '#22c55e', '#38bdf8']

export default function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes pg-fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1 } 100% { transform: translateY(420px) rotate(540deg); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .pg-confetti { animation: none !important; opacity: 0.6 } }
      `}</style>
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={i}
          className="pg-confetti absolute block rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 13) % 20}px`,
            width: 6 + (i % 4) * 2,
            height: 10 + (i % 3) * 3,
            background: COLORS[i % COLORS.length],
            animation: `pg-fall ${3 + (i % 5) * 0.6}s ease-in ${(i % 8) * 0.25}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
