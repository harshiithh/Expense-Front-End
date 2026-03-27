import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CreditCard, TrendingUp, Target, BarChart3, Zap } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: CreditCard, label: 'Expenses' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar({ open }) {
  return (
    <aside className={clsx(
      'flex flex-col bg-dark-800 border-r border-white/8 transition-all duration-300 shrink-0',
      open ? 'w-60' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-white/8 h-16">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet flex items-center justify-center shrink-0">
          <Zap size={18} className="text-black" />
        </div>
        {open && (
          <div>
            <div className="font-bold text-white text-sm leading-tight">ExpenseOS</div>
            <div className="text-xs text-white/30 font-mono">v1.0.0</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            clsx('sidebar-link', isActive && 'active', !open && 'justify-center px-0')
          }>
            <Icon size={18} className="shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom badge */}
      {open && (
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl p-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-accent font-mono">JWT Secured</span>
          </div>
        </div>
      )}
    </aside>
  )
}
