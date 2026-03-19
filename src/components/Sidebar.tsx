import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Wallet,
  Target,
  BarChart3,
  Moon,
  Sun,
  Plus,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const { signOut } = useAuth()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/transactions', icon: Receipt, label: t.nav.transactions },
    { to: '/credit-card', icon: CreditCard, label: t.nav.creditCard },
    { to: '/accounts', icon: Wallet, label: t.nav.accounts },
    { to: '/goals', icon: Target, label: t.nav.goals },
    { to: '/insights', icon: BarChart3, label: t.nav.insights },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card/80 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-sm">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent leading-tight">
              {t.common.appName}
            </h1>
            <p className="text-[10px] text-muted-foreground">{t.common.appTagline}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4', isActive && 'text-violet-500')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 space-y-1.5">
        <NavLink
          to="/quick-add"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t.nav.quickAdd}
        </NavLink>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? t.nav.lightMode : t.nav.darkMode}
        </button>
        <LanguageSwitcher />
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t.auth.logout}
        </button>
      </div>
    </aside>
  )
}
