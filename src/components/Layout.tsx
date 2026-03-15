import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ExpenseInput } from './ExpenseInput'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/i18n'

export function Layout() {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const { t } = useI18n()
  useTheme()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if user is not typing in an input or textarea
      const activeElement = document.activeElement
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement

      // Only trigger on desktop (not when mobile nav is in use)
      const isDesktop = window.innerWidth >= 1024

      if (!isInputFocused && isDesktop && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault()
        setExpenseModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />

      {/* Quick Add Modal (Desktop E key) */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.quickAdd.title}</DialogTitle>
          </DialogHeader>
          <ExpenseInput
            autoFocus
            size="large"
            onSuccess={() => setExpenseModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
