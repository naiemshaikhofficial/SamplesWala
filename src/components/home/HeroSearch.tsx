'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      onSubmit={handleSearch} 
      className="relative group w-full max-w-4xl px-4 md:px-0"
    >
        <Search className="absolute left-8 md:left-10 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-white/20 group-focus-within:text-white transition-colors" />
        <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH SAMPLES..."
            className="w-full bg-black/40 backdrop-blur-3xl border-2 border-white/10 h-16 md:h-24 px-12 md:px-20 text-[10px] md:text-md font-black uppercase tracking-[0.2em] md:tracking-[0.4em] outline-none focus:border-white transition-all placeholder:text-white/10 text-center"
        />
        <button type="submit" className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 bg-white text-black flex items-center justify-center hover:invert transition-all">
            <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
        </button>
    </motion.form>
  )
}
