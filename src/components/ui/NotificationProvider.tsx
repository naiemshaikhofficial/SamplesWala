'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, Info, Bell, ShieldAlert, Zap } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Script from 'next/script'
import { redeemCoupon, createTopUpOrder, verifyPayment } from '@/app/actions/commerce'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showConfirm: (message: string) => Promise<boolean>
  showAuthGate: () => void
  showTopUpModal: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    resolve: (value: boolean) => void
  } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, message, resolve })
    })
  }, [])

  const showAuthGate = useCallback(() => {
    setIsAuthGateOpen(true)
  }, [])

  const showTopUpModal = useCallback(() => {
    setIsTopUpOpen(true)
  }, [])

  const handleConfirm = (value: boolean) => {
    confirmState?.resolve(value)
    setConfirmState(null)
  }

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm, showAuthGate, showTopUpModal }}>
      <style dangerouslySetInnerHTML={{ __html: `
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      ` }} />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {children}
      
      {/* 🔱 GLOBAL TOASTER */}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-xs">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`
                pointer-events-auto p-4 border shadow-2xl flex items-start gap-4 backdrop-blur-xl
                ${toast.type === 'success' ? 'bg-white text-black border-white' : 
                  toast.type === 'error' ? 'bg-black text-red-500 border-red-500/50' : 
                  'bg-black text-white border-white/20'}
              `}
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {toast.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                {toast.type === 'info' && <Bell className="h-4 w-4" />}
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed flex-1">
                {toast.message}
              </p>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 🛡️ GLOBAL CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmState?.isOpen && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#050505] border border-white/10 p-10 shadow-2xl"
            >
              <div className="aspect-square w-12 border border-white/20 flex items-center justify-center mb-8 bg-white/5">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-8 italic">[ ACTION_REQUIRED ]</div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-10 leading-none underline decoration-white/20 decoration-4 underline-offset-8">
                {confirmState.message}
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleConfirm(true)}
                  className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  Confirm Transaction
                </button>
                <button
                  onClick={() => handleConfirm(false)}
                  className="w-full h-14 bg-black border border-white/20 text-white/40 font-black uppercase tracking-widest text-[11px] hover:text-white transition-all"
                >
                  Cancel Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🧬 GLOBAL AUTH GATE (SIGNAL LOCKED) */}
      <AnimatePresence>
        {isAuthGateOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAuthGateOpen(false)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    className="relative w-full max-w-lg bg-[#050505] border-2 border-white p-12 md:p-16 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
                >
                    <div className="absolute top-0 right-0 p-8">
                        <ShieldAlert className="h-12 w-12 text-red-500 animate-pulse" />
                    </div>
                    
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 italic">
                        [ LOGIN_REQUIRED ]
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.8] mb-8 italic">
                        PLEASE<br />LOGIN.
                    </h2>
                    
                    <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest leading-relaxed mb-12">
                        YOU NEED TO BE LOGGED IN TO AUDITION OR UNLOCK THESE PREMIUM SOUNDS. PLEASE CONNECT YOUR ACCOUNT TO CONTINUE.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                        <Link 
                            href="/auth/login"
                            onClick={() => setIsAuthGateOpen(false)}
                            className="h-16 bg-white text-black flex items-center justify-center font-black uppercase tracking-[0.3em] text-xs hover:invert transition-all gap-4"
                        >
                            LOGIN
                        </Link>
                        <button 
                            onClick={() => setIsAuthGateOpen(false)}
                            className="h-16 border border-white/10 text-white/20 flex items-center justify-center font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-all"
                        >
                            RETURN TO TERMINAL
                        </button>
                    </div>

                    <div className="mt-12 flex gap-1 justify-center">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-1 w-4 bg-white/5" />
                        ))}
                    </div>
                </motion.div>
            </div>
        )}
        {isTopUpOpen && <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />}
      </AnimatePresence>
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider')
  }
  return context
}

import { useRouter } from 'next/navigation'

// 🎰 CREDIT TOP-UP TERMINAL (1:1 INR MODEL)
function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter()
    const [amount, setAmount] = useState<number>(50)
    const [coupon, setCoupon] = useState('')
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'billing' | 'payment'>('billing')
    const [billing, setBilling] = useState({
        full_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    })
    const { showToast } = useNotify()
    const supabase = createClient()

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // 🧬 EDGE CACHE: Check local signature first
                const localBilling = localStorage.getItem(`billing_${user.id}`)
                if (localBilling) {
                    setBilling(JSON.parse(localBilling))
                    setStep('payment')
                    return
                }

                // 🏛️ VAULT SYNC: Fallback to Supabase
                const { data, error } = await supabase
                    .from('user_accounts')
                    .select('full_name, phone_number, address_line1, city, state, postal_code')
                    .eq('user_id', user.id)
                    .maybeSingle()
                
                // 🛠️ Schema check: If columns are missing, don't crash
                if (error) {
                    console.warn('[STUDIO_SYNC_WARNING] Billing columns missing in vault. Run master_restore.sql.');
                    return;
                }

                if (data && data.full_name) {
                    const cloudBilling = {
                        full_name: data.full_name || '',
                        phone: data.phone_number || '',
                        address: data.address_line1 || '',
                        city: data.city || '',
                        state: data.state || '',
                        zip: data.postal_code || ''
                    }
                    setBilling(cloudBilling)
                    localStorage.setItem(`billing_${user.id}`, JSON.stringify(cloudBilling))
                    setStep('payment')
                }
            } catch (e) {
                console.error('[STUDIO_TRANSCEIVER_ERROR]', e);
            }
        }
        fetchBilling()
    }, [supabase])

    const saveBilling = async () => {
        if (!billing.full_name || !billing.address || !billing.state) {
            showToast('ALL BILLING FIELDS REQUIRED FOR GST COMPLIANCE', 'error')
            return
        }
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('user_accounts')
                .update({
                    full_name: billing.full_name,
                    phone_number: billing.phone,
                    address_line1: billing.address,
                    city: billing.city,
                    state: billing.state,
                    postal_code: billing.zip
                }).eq('user_id', user.id)

            if (error) throw error

            // 🧬 EDGE SYNC: Update local signature
            localStorage.setItem(`billing_${user.id}`, JSON.stringify(billing))
            
            setStep('payment')
        } catch (e: any) {
            showToast(e.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        if (amount < 50) {
            setAmount(50)
            showToast('PLEASE ENTER AT LEAST 50 CREDITS', 'warning')
            return
        }

        if (typeof window === 'undefined' || !(window as any).Razorpay) {
            showToast('PAYMENT ENGINE NOT READY. TRY AGAIN IN 2s.', 'error')
            return
        }

        setLoading(true)
        try {
            // 🧪 Phase 1: Create Order in Backend
            const orderRes = await createTopUpOrder(amount)
            if (!orderRes || !orderRes.orderId) throw new Error('Failed to synchronize order with vault.')

            // 💳 Phase 2: Open Razorpay Checkout Terminal
            const options = {
                key: orderRes.key,
                amount: orderRes.amount,
                currency: orderRes.currency,
                name: "SAMPLES WALA",
                description: `Acquire ${amount} Studio Credits (SCR)`,
                order_id: orderRes.orderId,
                handler: async function (response: any) {
                    // 🔐 Phase 3: Secure Signature Verification
                    setLoading(true)
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                        
                        if (verifyRes.success) {
                            showToast(`TRANSACTION VERIFIED: ${amount} SCR ADDED TO VAULT.`, 'success')
                            window.dispatchEvent(new Event('refresh-credits'))
                            router.refresh()
                            onClose()
                        }
                    } catch (err: any) {
                        showToast(err.message || "SIGNATURE MISMATCH: UNAUTHORIZED INJECTION DETECTED.", "error")
                    } finally {
                        setLoading(false)
                    }
                },
                prefill: {
                    name: "Producer",
                    email: "studio@sampleswala.com"
                },
                theme: {
                    color: "#000000"
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.on('payment.failed', function (response: any) {
                showToast(`TRANSACTION REJECTED: ${response.error.description}`, 'error')
            })
            rzp.open()
        } catch (e: any) {
            showToast(e.message || "TERMINAL SYNCHRONIZATION FAILED", 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleRedeem = async () => {
        if (!coupon) return;
        setIsRedeeming(true);
        try {
            const res = await redeemCoupon(coupon)
            if (res.success) {
                showToast(`CODE VALIDATED: ${res.bonusCredits} BONUS SCR ADDED!`, 'success')
                setCoupon('')
                window.dispatchEvent(new Event('refresh-credits'))
                onClose()
            }
        } catch (err: any) {
             showToast(err.message || "INVALID OR EXPIRED CODE", 'error')
        } finally {
            setIsRedeeming(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            />
            
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-[#050505] border border-white/20 p-4 md:p-8 shadow-2xl overflow-y-hidden"
            >
                <div className="flex justify-between items-start mb-8">
                   <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-studio-yellow mb-2 italic">[ {step === 'billing' ? 'BILLING_INFO' : 'STORE_CREDITS'} ]</div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic">{step === 'billing' ? 'BILLING\nINFO' : 'ADD\nCREDITS.'}</h2>
                   </div>
                   <button onClick={onClose} className="p-4 hover:bg-white/5 transition-all">
                       <X className="h-6 w-6 text-white/40" />
                   </button>
                </div>

                {step === 'billing' ? (
                    <div className="space-y-4 mb-10">
                        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-2xl">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 leading-relaxed">
                                AS PER GOVERNMENT GST NORMS, VALID BILLING INFORMATION IS REQUIRED TO GENERATE INVOICES AND AUTHENTICATE TRANSACTIONS.
                             </p>
                             
                             <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="FULL LEGAL NAME" 
                                    value={billing.full_name}
                                    onChange={(e) => setBilling({...billing, full_name: e.target.value})}
                                    className="w-full bg-black border border-white/10 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="MOBILE PHONE NUMBER" 
                                    value={billing.phone}
                                    onChange={(e) => setBilling({...billing, phone: e.target.value})}
                                    className="w-full bg-black border border-white/10 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="STREET ADDRESS" 
                                    value={billing.address}
                                    onChange={(e) => setBilling({...billing, address: e.target.value})}
                                    className="w-full bg-black border border-white/10 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="CITY" 
                                        value={billing.city}
                                        onChange={(e) => setBilling({...billing, city: e.target.value})}
                                        className="bg-black border border-white/10 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="STATE / UT" 
                                        value={billing.state}
                                        onChange={(e) => setBilling({...billing, state: e.target.value})}
                                        className="bg-black border border-white/10 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="POSTAL CODE (ZIP)" 
                                    value={billing.zip}
                                    onChange={(e) => setBilling({...billing, zip: e.target.value})}
                                    className="w-full bg-black border border-white/10 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                                />
                             </div>
                        </div>

                        <button 
                            onClick={saveBilling}
                            disabled={loading}
                            className="h-20 w-full bg-white text-black flex items-center justify-center font-black uppercase tracking-[0.3em] text-xs hover:invert transition-all"
                        >
                            {loading ? <Zap className="h-6 w-6 animate-spin" /> : "CONTINUE TO PAYMENT"}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white/[0.03] border border-white/5 p-6 mb-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Studio Exchange Rate</span>
                        <div className="text-[10px] font-black uppercase text-white tracking-widest bg-white/10 px-3 py-1 rounded-full">
                            1 SCR : 1 ₹ INR
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {[50, 100, 250, 500, 1000, 2500].map(val => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={`h-14 flex flex-col items-center justify-center border font-black uppercase transition-all ${amount === val ? 'bg-white text-black border-white' : 'bg-black text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                <span className="text-[14px] leading-none mb-0.5">{val}</span>
                                <span className="text-[8px] opacity-60 tracking-widest">SCR</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-[10px]">CUSTOM</div>
                        <input 
                            type="number"
                            value={amount || ''}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            onBlur={() => {
                                if (amount > 0 && amount < 50) {
                                    setAmount(50);
                                    showToast('MINIMUM 50 CREDITS REQUIRED', 'warning');
                                }
                            }}
                            className="w-full bg-black border border-white/10 h-14 pl-24 pr-8 text-lg font-black uppercase text-white focus:border-studio-yellow focus:outline-none transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 text-[9px] font-black uppercase">₹ INR</div>
                    </div>
                    {amount > 0 && amount < 50 && (
                        <p className="text-[8px] font-black uppercase tracking-widest text-red-500 mt-2 ml-2 animate-pulse">
                            * MINIMUM 50 CREDITS REQUIRED
                        </p>
                    )}
                </div>

                {/* 🧧 PROMOTION CODE PROTOCOL */}
                <div className="mb-6 px-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 italic">Has Promotional Code?</span>
                        <div className="h-0.5 flex-1 mx-4 bg-white/5" />
                    </div>
                    <div className="relative flex gap-2">
                        <input 
                            type="text"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            placeholder="CODE (e.g. STUDIO25)"
                            className="flex-1 bg-black border border-white/10 h-14 pl-6 text-[10px] font-black uppercase text-white tracking-[0.2em] focus:border-studio-yellow focus:outline-none transition-all placeholder:text-white/10"
                        />
                        <button 
                          onClick={handleRedeem}
                          disabled={isRedeeming || !coupon}
                          className="px-8 h-14 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-studio-yellow hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/40"
                        >
                            {isRedeeming ? 'VALIDATING...' : 'REDEEM'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-2 px-2">
                        <span className="text-white/40">Total Acquisition Cost:</span>
                        <span className="text-studio-yellow">₹{amount.toLocaleString()} INR / ${(amount * 0.012).toFixed(2)} USD</span>
                    </div>
                    
                    <button 
                        onClick={handlePurchase}
                        disabled={loading}
                        className="h-16 bg-studio-yellow text-black flex items-center justify-center gap-4 group/buy hover:invert transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Zap className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Zap className="h-5 w-5 fill-black" />
                                <span className="text-[12px] font-black uppercase tracking-[0.3em]">PROCEED TO PURCHASE</span>
                            </>
                        )}
                    </button>
                    
                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/20 text-center leading-relaxed">
                        TRANSACTIONS ARE SECURELY GUARDED. CREDITS WILL BE INSTANTLY SYNCED TO YOUR VAULT.<br />BY PROCEEDING, YOU AGREE TO THE STUDIO TERMS OF SERVICE.
                    </p>
                    <button 
                        onClick={() => setStep('billing')}
                        className="text-[8px] font-black uppercase tracking-widest text-white/10 hover:text-white transition-colors"
                    >
                        [ EDIT_BILLING_INFO ]
                    </button>
                </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}
