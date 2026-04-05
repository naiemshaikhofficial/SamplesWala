'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
        router.push(`/browse?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative group w-full max-w-4xl">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-white transition-colors" />
        <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH YOUR SAMPLE..."
            className="w-full bg-black/40 backdrop-blur-3xl border-2 border-white/10 h-24 px-20 text-md font-black uppercase tracking-[0.4em] outline-none focus:border-white transition-all placeholder:text-white/10 text-center"
        />
        <button type="submit" className="absolute right-8 top-1/2 -translate-y-1/2 h-14 w-14 bg-white text-black flex items-center justify-center hover:invert transition-all">
            <ArrowRight className="h-6 w-6" />
        </button>
    </form>
  )
}
