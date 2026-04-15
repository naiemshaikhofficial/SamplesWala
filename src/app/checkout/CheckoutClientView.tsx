'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, User, Package, CreditCard, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Globe, IndianRupee, Activity } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import RazorpayCheckout from '@/components/payment/RazorpayCheckout'
import PayPalCheckout from '@/components/payment/PayPalCheckout'
import { createClient } from '@/lib/supabase/client'

interface CheckoutClientViewProps {
    item: any
    mode: string
    user: any
    profile: any
}

export default function CheckoutClientView({ item, mode, user, profile }: CheckoutClientViewProps) {
    const router = useRouter()
    const { showToast } = useNotify()
    const [loading, setLoading] = useState(false)
    const [gateway, setGateway] = useState<'RAZORPAY' | 'PAYPAL'>(profile?.country === 'India' || !profile?.country ? 'RAZORPAY' : 'PAYPAL')
    
    const [step, setStep] = useState(user ? 2 : 1)
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        address_line1: profile?.address_line1 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        postal_code: profile?.postal_code || '',
        country: profile?.country || 'India'
    })

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const supabase = createClient()
        
        let res;
        if (authMode === 'SIGNUP') {
            res = await supabase.auth.signUp({ email, password })
        } else {
            res = await supabase.auth.signInWithPassword({ email, password })
        }

        setLoading(false)
        if (res.error) showToast(res.error.message, 'error')
        else {
            showToast(authMode === 'SIGNUP' ? 'Registry Created.' : 'Identity Verified.', 'success')
            router.refresh()
            setStep(2)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (name === 'country') {
            if (value.toLowerCase() === 'india') setGateway('RAZORPAY')
            else setGateway('PAYPAL')
        }
    }

    const isFormValid = formData.full_name && formData.address_line1 && formData.city && formData.postal_code

    return (
        <div className="container mx-auto px-4 max-w-7xl">
            {/* 🏁 PROGRESS_FLOW_INDICATOR */}
            <div className="flex items-center justify-center gap-12 mb-20">
                {[
                    { id: 1, label: 'REGISTRY', icon: <User size={12} /> },
                    { id: 2, label: 'BILLING INFO', icon: <MapPin size={12} /> },
                    { id: 3, label: 'SYNCHRONIZE', icon: <CreditCard size={12} /> }
                ].map((s) => (
                    <div key={s.id} className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${step >= s.id ? 'border-studio-neon bg-studio-neon text-black box-default shadow-[0_0_15px_#a6e22e]' : 'border-white/10 text-white/20'}`}>
                            {s.icon}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${step >= s.id ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
                        {s.id < 3 && <div className="h-px w-12 bg-white/5" />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* 📂 LEFT_COLUMN: MAIN FLOW */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* STEP 1: IDENTITY ACCESS */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Establish Identity</h2>
                            <form onSubmit={handleAuth} className="bg-[#111] border border-white/5 p-8 rounded-sm space-y-6">
                                <div className="grid grid-cols-2 gap-2 mb-8">
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('SIGNUP')}
                                        className={`py-3 text-[9px] font-black uppercase tracking-widest transition-all ${authMode === 'SIGNUP' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                    >
                                        Create Node
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('LOGIN')}
                                        className={`py-3 text-[9px] font-black uppercase tracking-widest transition-all ${authMode === 'LOGIN' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                    >
                                        Access Existing
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <input 
                                        type="email" 
                                        placeholder="Email Signal"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black border border-white/5 p-4 text-sm focus:border-studio-neon focus:outline-none placeholder:text-white/5"
                                        required
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Encryption Key (Password)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black border border-white/5 p-4 text-sm focus:border-studio-neon focus:outline-none placeholder:text-white/5"
                                        required
                                    />
                                </div>
                                <button 
                                    disabled={loading}
                                    className="w-full bg-studio-neon text-black py-4 font-black uppercase tracking-widest hover:shadow-[0_0_30px_#a6e22e66] transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={14} />}
                                    {authMode === 'SIGNUP' ? 'Initialize Node' : 'Confirm Access'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2: BILLING & PAYMENT */}
                    {step >= 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Enter Billing Details</h2>
                            
                            <div className="bg-[#111] border border-white/5 p-8 rounded-sm space-y-10">
                                {/* FORM_FIELDS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Full Identity Name</label>
                                        <input 
                                            name="full_name" value={formData.full_name} onChange={handleInputChange}
                                            className="w-full bg-black/60 border border-white/5 p-4 text-sm focus:border-studio-neon outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Deployment Address</label>
                                        <input 
                                            name="address_line1" value={formData.address_line1} onChange={handleInputChange}
                                            className="w-full bg-black/60 border border-white/5 p-4 text-sm focus:border-studio-neon outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">City / Sector</label>
                                        <input 
                                            name="city" value={formData.city} onChange={handleInputChange}
                                            className="w-full bg-black/60 border border-white/5 p-4 text-sm focus:border-studio-neon outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Registry Code (ZIP)</label>
                                        <input 
                                            name="postal_code" value={formData.postal_code} onChange={handleInputChange}
                                            className="w-full bg-black/60 border border-white/5 p-4 text-sm focus:border-studio-neon outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Region Override (Country)</label>
                                        <input 
                                            name="country" value={formData.country} onChange={handleInputChange}
                                            className="w-full bg-black/60 border border-white/5 p-4 text-sm focus:border-studio-neon outline-none font-black text-studio-neon uppercase tracking-widest"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* PAYMENT_METHOD_PICKER */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Select Payment Terminal</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setGateway('RAZORPAY')}
                                            className={`p-6 border-2 transition-all flex flex-col items-center gap-3 ${gateway === 'RAZORPAY' ? 'bg-studio-neon/5 border-studio-neon shadow-[0_0_20px_rgba(166,226,46,0.1)]' : 'bg-black border-white/5 hover:border-white/10 opacity-40 hover:opacity-100'}`}
                                        >
                                            <IndianRupee size={24} className={gateway === 'RAZORPAY' ? 'text-studio-neon' : 'text-white/20'} />
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Razorpay (Domestic)</span>
                                        </button>
                                        <button 
                                            onClick={() => setGateway('PAYPAL')}
                                            className={`p-6 border-2 transition-all flex flex-col items-center gap-3 ${gateway === 'PAYPAL' ? 'bg-studio-neon/5 border-studio-neon shadow-[0_0_20px_rgba(166,226,46,0.1)]' : 'bg-black border-white/5 hover:border-white/10 opacity-40 hover:opacity-100'}`}
                                        >
                                            <Globe size={24} className={gateway === 'PAYPAL' ? 'text-studio-neon' : 'text-white/20'} />
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">PayPal (Global)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* ACTION_TERMINAL */}
                                <div className="pt-6">
                                    {isFormValid ? (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            {gateway === 'RAZORPAY' ? (
                                                <RazorpayCheckout itemId={item.id} mode={mode as any} planName={item.name} priceInr={item.price_inr} onSuccess={() => router.push('/browse')} />
                                            ) : (
                                                <PayPalCheckout itemId={item.id} itemType={mode as any} planName={item.name} onSuccess={() => router.push('/browse')} />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-[0.4em] text-center text-white/20 italic">
                                            Syncing form fields to unlock gateway...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 💳 RIGHT_COLUMN: ORDER SUMMARY */}
                <div className="lg:col-span-4 sticky top-32">
                    <div className="bg-[#151515] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8 flex items-center gap-3">
                                <Activity size={14} className="text-studio-neon" /> Order Manifest
                            </h2>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase">{item.name}</h3>
                                <button onClick={() => router.push('/pricing')} className="text-[8px] font-black uppercase tracking-widest text-studio-neon hover:underline">Change</button>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Frequency: Sync Every 30 Days</p>
                        </div>

                        <div className="p-8 bg-black/40 space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                <span>Signal Grant</span>
                                <span className="text-white">{item.credits} Credits</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                <span>Network Fees</span>
                                <span className="text-white">Included</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-studio-neon">Total Flow Cost</span>
                                <span className="text-5xl font-black italic tracking-tighter text-white">
                                    {gateway === 'RAZORPAY' ? `₹${item.price_inr}` : `$${item.price_usd}`}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 text-white/20">
                                <ShieldCheck size={14} />
                                <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encryption Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
