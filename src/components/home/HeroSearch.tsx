'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

export function HeroSearch({ onSearchChange }: { onSearchChange?: (val: string) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleChange = (val: string) => {
    setQuery(val)
    if (onSearchChange) onSearchChange(val)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
        router.push(`/browse?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form 
      onSubmit={handleSearch} 
      className="relative group w-full max-w-full mx-auto"
    >
        {/* LED INDICATORS - Hidden on narrow mobile to save space */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30 hidden xs:flex">
            <div className="w-1 h-3 bg-studio-neon shadow-[0_0_5px_#a6e22e]" />
            <div className="w-1 h-3 bg-studio-neon/20" />
        </div>

        <Search className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 h-4 w-4 md:h-6 md:w-6 text-white/20 group-focus-within:text-studio-neon transition-colors z-20" />
        
        <input 
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="SCAN_ARCHIVE..."
            className="w-full bg-black/80 backdrop-blur-3xl border-2 border-white/10 h-16 md:h-24 pl-12 md:pl-24 pr-16 md:pr-24 text-[10px] md:text-xl font-black uppercase tracking-widest outline-none focus:border-studio-neon transition-all placeholder:text-white/10 text-center italic"
        />

        <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center">
            <button 
                type="submit" 
                className="h-12 w-12 md:h-16 md:w-16 bg-studio-neon text-black flex items-center justify-center hover:bg-white transition-all shadow-xl"
            >
                <ArrowRight className="h-5 w-5 md:h-8 md:w-8" />
            </button>
        </div>
    </form>
  )
}
