import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, CreditCard, Wallet, Target, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'

export function MobileNav() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.nav.home },
    { to: '/transactions', icon: Receipt, label: t.nav.history },
    { to: '/credit-card', icon: CreditCard, label: t.nav.card },
    { to: '/accounts', icon: Wallet, label: t.nav.accounts },
    { to: '/goals', icon: Target, label: t.nav.goals },
  ]

  return (
    <>
      <button
        onClick={() => navigate('/quick-add')}
        className="lg:hidden fixed right-4 bottom-20 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
      >
        <Plus className="h-6 w-6" />
      </button>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs transition-colors min-w-[56px]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
