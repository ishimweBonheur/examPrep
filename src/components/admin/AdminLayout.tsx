import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import AdminSidebar from './AdminSidebar'
import { cn } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSkeleton'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isLoadingAuth } = useAuth()

  if (isLoadingAuth) return <PageLoader />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-[#f4f6fc]">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-30 md:hidden cursor-default"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          collapsed ? 'md:ml-[72px]' : 'md:ml-64'
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-border shadow-sm hover:bg-muted transition-colors"
            aria-label="Open admin menu"
          >
            <Menu className="w-4 h-4" />
            Menu
          </button>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
