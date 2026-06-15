import { createContext } from 'react'
import type { User } from '@/types'

interface AuthError {
  type: string
  message: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
  isLoadingPublicSettings: boolean
  authError: AuthError | null
  authChecked: boolean
  logout: (shouldRedirect?: boolean) => void
  navigateToLogin: () => void
  checkUserAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
