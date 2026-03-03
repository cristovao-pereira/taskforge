import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { auth, onAuthChange, logout as firebaseLogout, type User } from '../lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  const logout = useCallback(async () => {
    await firebaseLogout()
    setUser(null)
  }, [])

  const getIdToken = useCallback(async () => {
    if (!user) return null
    return await user.getIdToken()
  }, [user])

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      getIdToken,
    }),
    [user, loading, logout, getIdToken],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
