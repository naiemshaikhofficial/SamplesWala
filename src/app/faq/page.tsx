
import { Metadata } from 'next'
import FAQContent from '@/components/faq/FAQContent'

export const metadata: Metadata = {
    title: 'Support Console | Help & FAQ | SAMPLES WALA',
    description: 'Access surgical troubleshooting guides and frequently asked protocols regarding subscriptions, cancellations, and royalty-free licensing.',
}

export default function HelpPage() {
    const faqs = [
        { q: "How does the subscription work?", a: "Samples Wala operates on a membership architecture where subscribers receive monthly credits to unlock high-fidelity audio artifacts." },
        { q: "How do I cancel my membership?", a: "You can terminate your membership via the Settings terminal. Access remains active until the end of the current billing cycle." },
        { q: "Are samples royalty-free?", a: "Yes. All artifacts feature a lifetime commercial license for worldwide production use." }
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-12 md:pt-24 pb-24 relative overflow-hidden font-mono selection:bg-studio-neon selection:text-black">
             {/* 🏁 SCANLINE & GRID OVERLAY */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
             
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

            {/* Visualizer Footer Decoration */}
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden z-50">
                <div className="h-full bg-studio-neon w-1/3 animate-loading-bar" />
            </div>
        </div>
    )
}
