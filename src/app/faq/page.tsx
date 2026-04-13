
import { HelpCircle, Zap, Cpu, Mail, Activity, MessageSquare, ShieldQuestion } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import FAQContent from '@/components/faq/FAQContent'

export const metadata: Metadata = {
    title: 'Support Console | Help & FAQ | SAMPLES WALA',
    description: 'Find surgical troubleshooting guides and frequently asked questions about credits, licenses, and subscriptions on SamplesWala.',
}

export default function HelpPage() {
    const faqs = [
        { q: "How do credits work?", a: "Each individual sample costs 1 credit. Packs can be purchased as a full signal for discounted credit rates." },
        { q: "Can I cancel my subscription?", a: "Yes. Use the Settings gear icon in the header to access the membership management terminal." },
        { q: "Are loops royalty-free?", a: "100%. All samples on SAMPLES WALA are high-fidelity royalty-free artifacts." }
    ]

    return (
        <div className="min-h-screen bg-studio-charcoal text-white pt-24 md:pt-32 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
             {/* 📝 FAQ_SCHEMA (JSON-LD) */}
             <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqs.map(faq => ({
                            "@type": "Question",
                            "name": faq.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.a
                            }
                        }))
                    })
                }}
            />
            
            <FAQContent />
        </div>
    )
}
