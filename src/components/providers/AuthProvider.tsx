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

export function AuthProvider({ 
  children,
  initialUser = undefined
}: { 
  children: React.ReactNode,
  initialUser?: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [isLoading, setIsLoading] = useState(initialUser === undefined)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    // If we have an initial user, we've already done the work on the server
    if (initialUser) {
      setIsLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return

      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }

      if (event === 'SIGNED_OUT') {
        window.location.reload()
      }
      
      setIsLoading(false)
    })

    // Fallback/Verification check if initialUser wasn't provided or to ensure sync
    if (!initialUser) {
      const initAuth = async () => {
        try {
          const { data: { user: verifiedUser } } = await supabase.auth.getUser()
          if (isMounted) {
            setUser(verifiedUser)
            setIsLoading(false)
          }
        } catch (err) {
          console.error('[AUTH_INIT_ERROR]', err)
          if (isMounted) setIsLoading(false)
        }
      }
      initAuth()
    }

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase, initialUser])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
