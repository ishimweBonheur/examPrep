import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { base44 } from '@/api/client'
import type { User } from '@/types'
import { AuthContext } from '@/lib/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [authError, setAuthError] = useState<{ type: string; message: string } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true)
      const currentUser = await base44.auth.me()
      setUser(currentUser as User)
      setIsAuthenticated(true)
      setAuthError(null)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoadingAuth(false)
      setAuthChecked(true)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- auth bootstrap on mount
    void checkUserAuth()
  }, [checkUserAuth])

  const logout = (shouldRedirect = true) => {
    setUser(null)
    setIsAuthenticated(false)
    base44.auth.logout(shouldRedirect ? '/' : undefined)
  }

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
