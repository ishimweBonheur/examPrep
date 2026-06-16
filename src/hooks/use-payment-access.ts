import { useQuery } from '@tanstack/react-query'
import { fetchAccessStatus } from '@/api/http'
import { useAuth } from '@/hooks/use-auth'

const FREE_ROUTES = new Set([
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/billing',
  '/dashboard/settings',
  '/dashboard/notifications',
  '/dashboard/help',
])

export function isFreeRoute(path: string): boolean {
  return FREE_ROUTES.has(path.replace(/\/$/, '') || '/dashboard')
}

export function usePaymentAccess() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['access-status', user?.id],
    queryFn: fetchAccessStatus,
    enabled: !!user?.id && user.role === 'student',
    staleTime: 30_000,
  })

  const hasFullAccess =
    user?.role === 'admin' ||
    user?.role === 'teacher' ||
    user?.admin_approved ||
    data?.has_full_access ||
    false

  return { hasFullAccess, isLoading, adminApproved: user?.admin_approved || data?.admin_approved }
}
