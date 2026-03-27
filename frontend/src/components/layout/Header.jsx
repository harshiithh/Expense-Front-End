import { Menu, Bell, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="h-16 bg-dark-800 border-b border-white/8 flex items-center justify-between px-6 shrink-0">
      <button onClick={onToggleSidebar}
        className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center">
            <span className="text-xs font-bold text-black">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-white leading-tight">{user?.fullName}</div>
            <div className="text-xs text-white/40">{user?.email}</div>
          </div>
          <button onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all ml-1">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
