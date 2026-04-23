'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        // 🛡️ Verified user check (Secure but optimized to run once)
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setUser(user)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('[AUTH_INIT_ERROR]', err)
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        window.location.reload()
      }
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
