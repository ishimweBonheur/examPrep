import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import PortalHeader from './PortalHeader'
import PaymentGate from '@/components/PaymentGate'

export default function PortalLayout() {
  const { user, isLoadingAuth } = useAuth()

  if (isLoadingAuth) return <PageLoader />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <PortalHeader />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-6">
          <PaymentGate>
            <Outlet />
          </PaymentGate>
        </div>
      </main>
    </div>
  )
}