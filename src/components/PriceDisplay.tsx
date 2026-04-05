'use client'
import { useCurrency } from './CurrencyProvider'

export function PriceDisplay({ inr, usd, className = "" }: { inr: number, usd: number, className?: string }) {
  const { format } = useCurrency()
  return <span className={className}>{format(inr, usd)}</span>
}
