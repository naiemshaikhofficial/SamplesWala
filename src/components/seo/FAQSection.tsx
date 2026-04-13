'use client'

import React from 'react'

type FAQItem = {
  q: string
  a: string
}

interface FAQSectionProps {
  items: FAQItem[]
  title?: string
  subtitle?: string
}

export function FAQSection({ items, title, subtitle }: FAQSectionProps) {
  // 📝 FAQ_SCHEMA (JSON-LD)
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <section className="relative z-20 py-20 md:py-32 bg-black border-b-4 border-white/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="flex items-center gap-4 mb-16 border-l-4 border-studio-neon pl-8 text-left">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
              {title || "Common_Inquiries"} <span className="text-studio-neon">[{subtitle || "FAQ"}]</span>
            </h2>
          </div>
        )}

        <div className="space-y-8">
          {items.map((item, i) => (
            <div key={i} className="group p-8 border border-white/5 bg-studio-grey/20 hover:border-studio-neon/50 transition-all text-left">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white/80 group-hover:text-studio-neon mb-4 transition-colors">
                {item.q}
              </h3>
              <p className="text-sm md:text-base text-white/40 leading-relaxed font-bold italic">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
