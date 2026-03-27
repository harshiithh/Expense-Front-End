import clsx from 'clsx'
export default function StatCard({ title, value, change, icon: Icon, color = 'accent', trend }) {
  const colors = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    violet: 'text-violet bg-violet/10 border-violet/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  }
  return (
    <div className="stat-card group">
      <div className={clsx('absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30',
        color === 'accent' ? 'bg-accent' : color === 'violet' ? 'bg-violet' : color === 'red' ? 'bg-red-500' : 'bg-yellow-500'
      )} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={clsx('p-2.5 rounded-xl border', colors[color])}>
            <Icon size={18} />
          </div>
          {trend !== undefined && (
            <span className={clsx('text-xs font-mono px-2 py-1 rounded-lg',
              trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="text-xs text-white/40 font-mono uppercase tracking-widest mb-1">{title}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && <div className="text-xs text-white/30 mt-1">{change}</div>}
      </div>
    </div>
  )
}
