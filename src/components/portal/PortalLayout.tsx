import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import PortalHeader from './PortalHeader'

export default function PortalLayout() {
  const { user, isLoadingAuth } = useAuth()

  if (isLoadingAuth) return <PageLoader />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <PortalHeader />
      <main className="flex-1 px-4 py-6 sm:px-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
