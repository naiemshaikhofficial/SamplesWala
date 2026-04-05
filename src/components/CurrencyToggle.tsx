'use client'
import { Globe } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <button 
      onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-white/10 rounded-full hover:bg-white/5 transition-all text-white/60 hover:text-white"
    >
      <Globe className="h-3 w-3" />
      <span>{currency}</span>
    </button>
  )
}
