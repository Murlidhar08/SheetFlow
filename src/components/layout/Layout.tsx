import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSheetStore } from '../../store/useSheetStore'
import { LayoutDashboard, Settings, PlusCircle, LogOut, ChevronLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const Layout = () => {
  const { user, logout } = useSheetStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/entry', label: 'Add Entry', icon: PlusCircle },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </Link>
          <div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface block">SheetFlow</span>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{user?.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Mobile style as per design) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border border-outline-variant/20 px-4 py-3 shadow-2xl flex justify-center items-center gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-on-surface-variant hover:bg-surface-container"
              )}
            >
              <Icon className="w-5 h-5" />
              {isActive && <span className="font-label font-bold text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Layout
