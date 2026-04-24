'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

type Currency = 'INR' | 'USD'

type CurrencyContextType = {
  currency: Currency
  setCurrency: (c: Currency) => void
  format: (inr: number | null | undefined, usd: number | null | undefined) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('INR')

  useEffect(() => {
    const saved = localStorage.getItem('currency') as Currency
    if (saved) setCurrencyState(saved)
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem('currency', c)
  }

  const format = (inr: number | null | undefined, usd: number | null | undefined) => {
    if (!inr && !usd) return ''; // 🧬 SILENCE_SIGNAL: Don't show if zero or null
    
    if (currency === 'INR') {
      const val = inr ?? 0
      return '₹' + val.toLocaleString()
    }
    const val = usd ?? 0
    return '$' + val.toFixed(2)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}
