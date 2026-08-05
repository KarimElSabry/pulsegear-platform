// src/app/admin/analytics/StatCard.tsx

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color?: 'purple' | 'green' | 'blue' | 'yellow' | 'red' | 'pink'
}

const colorMap = {
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  green:  'border-green-500/30  bg-green-500/10  text-green-400',
  blue:   'border-blue-500/30   bg-blue-500/10   text-blue-400',
  yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  red:    'border-red-500/30    bg-red-500/10    text-red-400',
  pink:   'border-pink-500/30   bg-pink-500/10   text-pink-400',
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'purple',
}: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-white text-3xl font-black">{value}</p>
      {subtitle && (
        <p className="text-zinc-500 text-xs">{subtitle}</p>
      )}
    </div>
  )
}