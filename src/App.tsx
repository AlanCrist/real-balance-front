import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/i18n/I18nProvider'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { QuickAdd } from '@/pages/QuickAdd'
import { Transactions } from '@/pages/Transactions'
import { CreditCardPage } from '@/pages/CreditCardPage'
import { Accounts } from '@/pages/Accounts'
import { Goals } from '@/pages/Goals'
import { Insights } from '@/pages/Insights'
import { Onboarding } from '@/pages/Onboarding'
import { useStore } from '@/store/useStore'

function AppRoutes() {
  const onboarding = useStore((s) => s.onboarding)

  if (!onboarding.completed) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

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
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  )
}
