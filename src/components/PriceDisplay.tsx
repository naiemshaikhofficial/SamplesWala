'use client'
import { useCurrency } from './CurrencyProvider'

export function PriceDisplay({ inr, usd, className = "" }: { inr: number | null | undefined, usd: number | null | undefined, className?: string }) {
  const { format } = useCurrency()
  const price = format(inr, usd)
  if (!price) return null
  return <span className={className}>{price}</span>
}
