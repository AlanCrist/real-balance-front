import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/i18n/I18nProvider'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Dashboard } from '@/pages/Dashboard'
import { QuickAdd } from '@/pages/QuickAdd'
import { Transactions } from '@/pages/Transactions'
import { CreditCardPage } from '@/pages/CreditCardPage'
import { Accounts } from '@/pages/Accounts'
import { Goals } from '@/pages/Goals'
import { Insights } from '@/pages/Insights'
import { Onboarding } from '@/pages/Onboarding'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import { useStore } from '@/store/useStore'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const fetchAll = useStore((s) => s.fetchAll)
  const clearAll = useStore((s) => s.clearAll)

  useEffect(() => {
    if (user) {
      fetchAll()
    } else {
      clearAll()
    }
  }, [user, fetchAll, clearAll])

  return <>{children}</>
}

function AppRoutes() {
  const { user, loading: authLoading } = useAuth()
  const profile = useStore((s) => s.profile)
  const storeLoading = useStore((s) => s.loading)

  if (authLoading || (user && storeLoading)) {
    return <LoadingScreen />
  }

  // Not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Logged in but not onboarded
  if (!profile?.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  // Authenticated + onboarded
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/credit-card" element={<CreditCardPage />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/insights" element={<Insights />} />
      </Route>
      <Route path="/quick-add" element={<QuickAdd />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppInitializer>
            <AppRoutes />
          </AppInitializer>
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
  )
}
