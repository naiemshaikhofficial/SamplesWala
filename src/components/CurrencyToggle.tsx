'use client'
import { Globe } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <button 
      onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
      className="flex items-center gap-2 px-4 py-2 bg-[#111] border-2 border-white/5 hover:border-studio-neon transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-studio-neon opacity-20 group-hover:opacity-100 transition-opacity" />
      <Globe className="h-3 w-3 text-white/40 group-hover:text-studio-neon" />
      <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{currency}</span>
      <div className="flex flex-col gap-0.5 ml-2 h-4 justify-center">
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <div className={`w-1 h-1 rounded-full ${currency === 'INR' ? 'bg-studio-neon' : 'bg-white/20'}`} />
          <div className={`w-1 h-1 rounded-full ${currency === 'USD' ? 'bg-studio-neon' : 'bg-white/20'}`} />
      </div>
    </button>
  )
}
