
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CacheContextProps {
  version: string
  refreshCache: () => void
}

const CacheContext = createContext<CacheContextProps | undefined>(undefined)

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState<string>('1')

  useEffect(() => {
    // 🧬 Check DB version on initial load for reactive syncing
    // In a full implementation, we'd fetch the DB version here
    // For now we'll use '1' and update later
  }, [])

  const refreshCache = () => {
    // 🧪 Increment version to force re-fetch across the app
    setVersion(prev => (parseInt(prev) + 1).toString())
  }

  return (
    <CacheContext.Provider value={{ version, refreshCache }}>
      {children}
    </CacheContext.Provider>
  )
}

export const useCache = () => {
  const context = useContext(CacheContext)
  if (!context) throw new Error('useCache must be used within a CacheProvider')
  return context
}
