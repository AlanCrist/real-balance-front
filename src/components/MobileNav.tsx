import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, CreditCard, MoreHorizontal, Plus, Wallet, Target, BarChart3, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useI18n()
  const { signOut } = useAuth()

  const mainItems = [
    { to: '/', icon: LayoutDashboard, label: t.nav.home },
    { to: '/transactions', icon: Receipt, label: t.nav.history },
    { to: '/credit-card', icon: CreditCard, label: t.nav.card },
  ]

  const moreItems = [
    { to: '/accounts', icon: Wallet, label: t.nav.accounts },
    { to: '/goals', icon: Target, label: t.nav.goals },
    { to: '/insights', icon: BarChart3, label: t.nav.insights },
  ]

  return (
    <>
      {/* FAB - Quick Add */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/quick-add')}
        className="lg:hidden fixed right-4 bottom-20 z-50 h-14 w-14 rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="lg:hidden fixed bottom-[72px] left-2 right-2 z-50 rounded-2xl border bg-card p-3 shadow-xl"
            >
              <div className="grid grid-cols-3 gap-2">
                {moreItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-medium transition-all',
                        isActive
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : 'text-muted-foreground hover:bg-accent'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </NavLink>
                ))}
                <button
                  onClick={() => { setMoreOpen(false); signOut() }}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t.auth.logout}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-1.5">
          {mainItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all min-w-[64px]',
                  isActive ? 'text-violet-500' : 'text-muted-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-1 h-0.5 w-5 rounded-full bg-violet-500"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all min-w-[64px]',
              moreOpen ? 'text-violet-500' : 'text-muted-foreground'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {moreOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="more" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <MoreHorizontal className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span>{t.nav.more}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
