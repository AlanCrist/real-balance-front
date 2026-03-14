import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Wallet,
  Target,
  Moon,
  Sun,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/transactions', icon: Receipt, label: t.nav.transactions },
    { to: '/credit-card', icon: CreditCard, label: t.nav.creditCard },
    { to: '/accounts', icon: Wallet, label: t.nav.accounts },
    { to: '/goals', icon: Target, label: t.nav.goals },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          {t.common.appName}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t.common.appTagline}</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-2">
        <NavLink
          to="/quick-add"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.nav.quickAdd}
        </NavLink>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? t.nav.lightMode : t.nav.darkMode}
        </button>
        <LanguageSwitcher />
      </div>
    </aside>
  )
}
