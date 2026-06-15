import { useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function PageNotFound() {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const pageName = location.pathname.substring(1)

  useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    enabled: isAuthenticated,
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-light text-muted-foreground/40">404</h1>
          <div className="h-0.5 w-16 bg-border mx-auto" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-medium">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page <span className="font-medium text-foreground">"{pageName}"</span> could not be found.
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="p-4 bg-muted rounded-lg border border-border text-left text-sm">
            <p className="font-medium">Admin Note</p>
            <p className="text-muted-foreground mt-1">This route may not be implemented yet.</p>
          </div>
        )}
        <Link to="/">
          <Button className="gap-2"><Home className="w-4 h-4" /> Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
