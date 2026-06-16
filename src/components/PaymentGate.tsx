import { Navigate, useLocation } from 'react-router-dom'
import { usePaymentAccess, isFreeRoute } from '@/hooks/use-payment-access'
import { PageLoader } from '@/components/shared/LoadingSkeleton'

export default function PaymentGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { hasFullAccess, isLoading } = usePaymentAccess()

  if (isLoading) return <PageLoader />

  if (!hasFullAccess && !isFreeRoute(location.pathname)) {
    return <Navigate to="/dashboard/billing" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
