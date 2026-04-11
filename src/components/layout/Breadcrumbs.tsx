'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

type Breadcrumb = {
  label: string
  href: string
  active?: boolean
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // 📝 BREADCRUMB_SCHEMA (JSON-LD)
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://sampleswala.com${item.href}`
    }))
  };

  return (
    <nav className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <Link 
        href="/" 
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-studio-neon transition-colors shrink-0"
      >
        <Home size={10} />
        ROOT
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 shrink-0">
          <ChevronRight size={10} className="text-white/10" />
          <Link
            href={item.href}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              item.active 
                ? 'text-studio-neon' 
                : 'text-white/20 hover:text-white/40'
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}
