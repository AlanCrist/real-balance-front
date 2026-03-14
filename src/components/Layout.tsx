import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { useTheme } from '@/hooks/useTheme'

export function Layout() {
  useTheme()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
