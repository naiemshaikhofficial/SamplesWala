'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react'

export function CancelSubscriptionButton() {
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleCancel = async () => {
        setIsLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user;
            if (!user) throw new Error('AUTH_SIGNAL_MISSING')

            const { error } = await supabase
                .from('user_accounts')
                .update({ 
                    subscription_status: 'CANCELED',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)

            if (error) throw error
            
            setShowModal(false)
            router.refresh()
            window.location.reload()
        } catch (error) {
            console.error('CANCELLATION_ERROR:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className="w-full py-4 px-6 bg-red-950/20 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-center text-[10px] font-black uppercase tracking-[0.4em] italic rounded-sm flex items-center justify-center gap-3 group shadow-xl"
            >
                <Trash2 size={12} className="group-hover:animate-bounce" />
                Cancel Subscription — सदस्य रद करें
            </button>

            {/* 🧬 CUSTOM_HIGH_FIDELITY_MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    {/* OVERLAY */}
                    <div 
                        className="fixed inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setShowModal(false)}
                    />
                    
                    {/* MODAL_TERMINAL */}
                    <div className="relative w-full max-w-lg bg-[#0a0a0a] border-2 border-red-500/30 rounded-sm shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-1.5 bg-red-500/10 border-b border-red-500/10 flex justify-between items-center px-4">
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-red-500/60 italic">
                                <ShieldAlert size={10} /> CRITICAL_SIGNAL_INTERRUPT
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-10 md:p-14 text-center">
                            <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-red-500">
                                <AlertTriangle size={32} />
                            </div>
                            
                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white mb-6 leading-none">
                                CANCEL <span className="text-red-500">PLAN?</span>
                            </h3>

                            <div className="space-y-4 mb-10">
                                <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white/60 italic leading-relaxed">
                                    ARE YOU SURE YOU WANT TO STOP YOUR MEMBERSHIP?
                                </p>
                                <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 leading-relaxed italic">
                                        WARNING :: ALL MONTHLY CREDITS AND PREMIUM PERKS WILL STOP AT THE END OF YOUR BILLING CYCLE.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="py-5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all italic rounded-sm shadow-xl"
                                >
                                    GO BACK
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="py-5 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 transition-all italic rounded-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? 'WORKING...' : 'CONFIRM CANCEL'}
                                </button>
                            </div>
                        </div>

                        {/* 🧬 Decorative background element */}
                        <div className="absolute -right-20 -bottom-20 opacity-[0.05] pointer-events-none rotate-45 scale-150">
                            <AlertTriangle size={300} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
