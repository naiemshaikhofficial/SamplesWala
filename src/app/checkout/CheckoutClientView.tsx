'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useNotify } from '@/components/ui/NotificationProvider'
import { 
    CreditCard, MapPin, User, ShieldCheck, Zap, Globe, 
    Ticket, Tag, Phone, Activity, Loader2, Disc 
} from 'lucide-react'
import Image from 'next/image'
import RazorpayCheckout from '@/components/payment/RazorpayCheckout'
import PayPalCheckout from '@/components/payment/PayPalCheckout'
import Turnstile from '@/components/auth/Turnstile'
import Script from 'next/script'

interface CheckoutProps {
    item: any
    mode: 'subscription' | 'pack' | 'cart' | 'sample_pack' | 'software'
    currency: 'INR' | 'USD'
    initialUser?: any
    initialProfile?: any
}

export default function CheckoutClientView({ item, mode, currency, initialUser, initialProfile }: CheckoutProps) {
    const router = useRouter()
    const { user: authUser, isLoading: authLoading } = useAuth()
    const user = initialUser || authUser
    const { showToast } = useNotify()
    
    // 🛡️ AUTH_RESILIENCE: Robust step initialization to prevent "Guest" UI flicker
    const [step, setStep] = useState(initialUser || (authLoading ? null : authUser) ? 2 : 1)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP')
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY')
    const [couponCode, setCouponCode] = useState('')
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null)

    // 🧬 CART_STATE
    const [items, setItems] = useState<any[]>([])
    const [totalItems, setTotalItems] = useState(0)

    useEffect(() => {
        if (mode === 'cart') {
            const savedCart = localStorage.getItem('studio_cart')
            if (savedCart) {
                const parsed = JSON.parse(savedCart)
                setItems(parsed)
                setTotalItems(parsed.length)
            }
        }
    }, [mode])

    const [formData, setFormData] = useState({
        full_name: initialProfile?.full_name || '',
        phone_number: initialProfile?.phone_number || '',
        address_line1: initialProfile?.address_line1 || '',
        city: initialProfile?.city || '',
        state: initialProfile?.state || '',
        postal_code: initialProfile?.postal_code || '',
        country: initialProfile?.country || (currency === 'INR' ? 'India' : 'International')
    })

    useEffect(() => {
        // 🧬 SYNC_AUTH_STEP: Automatically transition when user becomes available
        if (user && step === 1) {
            setStep(2)
        }
        
        if (user) {
            const fetchProfile = async () => {
                const supabase = createClient()
                const { data } = await supabase.from('user_accounts').select('*').eq('user_id', user.id).single()
                if (data) {
                    setFormData({
                        full_name: data.full_name || '',
                        phone_number: data.phone_number || '',
                        address_line1: data.address_line1 || '',
                        city: data.city || '',
                        state: data.state || '',
                        postal_code: data.postal_code || '',
                        country: data.country || (currency === 'INR' ? 'India' : 'International')
                    })
                }
            }
            fetchProfile()
        }
    }, [user, currency, step])

    const calculatePrice = () => {
        if (mode === 'cart') {
            return currency === 'INR' 
                ? items.reduce((s, i) => s + (i.price_inr || 0), 0)
                : items.reduce((s, i) => s + (i.price_usd || 0), 0)
        }
        
        let basePrice = 0
        if (mode === 'subscription') {
            basePrice = billingCycle === 'MONTHLY' 
                ? (currency === 'INR' ? item?.price_inr || 0 : item?.price_usd || 0)
                : (currency === 'INR' ? item?.price_inr_annual || 0 : item?.price_usd_annual || 0)
        } else {
            basePrice = currency === 'INR' ? item?.price_inr || 0 : item?.price_usd || 0
        }

        if (appliedDiscount) {
            if (appliedDiscount.discountPercent) {
                basePrice = basePrice * (1 - appliedDiscount.discountPercent / 100)
            } else {
                const amount = currency === 'INR' ? appliedDiscount.discountAmountInr : appliedDiscount.discountAmountUsd
                basePrice = Math.max(0, basePrice - (amount || 0))
            }
        }
        return Math.round(basePrice)
    }

    const finalPrice = calculatePrice()

    const isTrialEligible = mode === 'subscription' && item?.trial_days > 0
    const annualSavings = mode === 'subscription' ? Math.round((1 - ((item?.price_inr_annual || 0) / ((item?.price_inr || 1) * 12))) * 100) : 0

    const handleApplyCoupon = async () => {
        if (!couponCode) return
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single()
        
        if (error || !data) {
            showToast('Invalid coupon code.', 'error')
            setAppliedDiscount(null)
        } else {
            setAppliedDiscount(data)
            showToast('Coupon applied successfully!', 'success')
        }
        setLoading(false)
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!turnstileToken) {
            showToast('Please complete the verification.', 'error')
            return
        }
        setLoading(true)
        const supabase = createClient()
        
        if (authMode === 'SIGNUP') {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) showToast(error.message, 'error')
            else showToast('Account created! Please check your email.', 'success')
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) showToast(error.message, 'error')
            else setStep(2)
        }
        setLoading(false)
    }

    const handleGoogleAuth = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=/checkout` }
        })
        if (error) showToast(error.message, 'error')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const saveAddress = async () => {
        if (!user) return true
        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase.from('user_accounts').update({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            address_line1: formData.address_line1,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            updated_at: new Date().toISOString()
        }).eq('user_id', user.id)
        
        setLoading(false)
        if (error) {
            console.error('Save error:', error)
            showToast('Failed to save address.', 'error')
            return false
        }
        return true
    }

    const isFormValid = formData.full_name && formData.address_line1 && formData.city && formData.postal_code && formData.phone_number

    if (authLoading && !initialUser) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-studio-neon" size={48} />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 max-w-7xl pt-32 pb-20">
            {/* 🚀 PRELOAD_INFRASTRUCTURE */}
            <Script 
                src="https://checkout.razorpay.com/v1/checkout.js" 
                strategy="afterInteractive"
            />
            
            {/* 🏁 PROGRESS_FLOW */}
            <div className="flex items-center justify-center gap-12 mb-20 px-4">
                {[
                    { id: 1, label: 'Account', icon: <User size={12} /> },
                    { id: 2, label: 'Address', icon: <MapPin size={12} /> },
                    { id: 3, label: 'Payment', icon: <CreditCard size={12} /> }
                ].map((s) => (
                    <div key={s.id} className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all ${step >= s.id ? 'border-studio-neon bg-studio-neon text-black shadow-[0_0_15px_#a6e22e66]' : 'border-white/10 text-white/20'}`}>
                            {s.icon}
                        </div>
                        <span className={`hidden md:block text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
                        {s.id < 3 && <div className="h-px w-8 md:w-12 bg-white/5" />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-8 space-y-12">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 max-w-lg mx-auto w-full relative">
                            {/* 🛠️ RACK_DECOR */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-32 w-1 bg-white/5 rounded-full" />
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-32 w-1 bg-white/5 rounded-full" />
                            
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-center flex items-center justify-center gap-4">
                                <Activity className="text-studio-neon animate-pulse" size={24} />
                                Join Samples Wala
                            </h2>
                            
                            <div className="bg-[#0a0a0a] border-2 border-white/5 p-8 rounded-2xl shadow-2xl space-y-8 relative overflow-hidden group">
                                <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/10" />
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/10" />
                                <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/10" />
                                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-white/10" />

                                <button 
                                    onClick={handleGoogleAuth}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-xl relative overflow-hidden"
                                >
                                    <svg height="20" viewBox="0 0 24 24" width="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.49 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                    Continue with Google
                                </button>

                                <div className="relative flex items-center py-2">
                                     <div className="flex-grow border-t border-white/5"></div>
                                     <span className="flex-shrink mx-4 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">OR USE EMAIL</span>
                                     <div className="flex-grow border-t border-white/5"></div>
                                 </div>

                                 <form onSubmit={handleAuth} className="space-y-6">
                                     <div className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10 shadow-inner">
                                         <button type="button" onClick={() => setAuthMode('SIGNUP')} className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'SIGNUP' ? 'bg-studio-neon text-black shadow-[0_0_20px_rgba(166,226,46,0.3)]' : 'text-white/40 hover:text-white'}`}>Sign Up</button>
                                         <button type="button" onClick={() => setAuthMode('LOGIN')} className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'LOGIN' ? 'bg-studio-neon text-black shadow-[0_0_20px_rgba(166,226,46,0.3)]' : 'text-white/40 hover:text-white'}`}>Login</button>
                                     </div>

                                     <div className="space-y-4">
                                         <div className="relative group">
                                             <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/5 group-focus-within:bg-studio-neon transition-colors" />
                                             <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" required />
                                         </div>
                                         <div className="relative group">
                                             <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/5 group-focus-within:bg-studio-neon transition-colors" />
                                             <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" required />
                                         </div>
                                     </div>

                                     <Turnstile onVerify={setTurnstileToken} />

                                     <button disabled={loading} className="group relative w-full bg-[#111] border-2 border-white/5 text-white/40 py-5 rounded-xl font-black uppercase tracking-[0.4em] hover:border-studio-neon hover:text-studio-neon transition-all flex items-center justify-center gap-4 shadow-2xl overflow-hidden active:scale-[0.98]">
                                         <div className="absolute inset-0 bg-studio-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap size={16} className="group-hover:animate-pulse" />}
                                         <span className="text-xs">{authMode === 'SIGNUP' ? 'Create Account' : 'Login Now'}</span>
                                     </button>
                                 </form>
                            </div>
                        </div>
                    )}

                    {step >= 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
                            {mode === 'subscription' && (
                                <div className="space-y-6 relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-10 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                                        <h2 className="text-2xl font-black uppercase tracking-[0.2em]">Select Plan</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button onClick={() => setBillingCycle('MONTHLY')} className={`group relative p-8 border-2 rounded-2xl text-left transition-all overflow-hidden ${billingCycle === 'MONTHLY' ? 'border-studio-neon bg-[#151515] shadow-[0_0_40px_rgba(166,226,46,0.1)]' : 'border-white/5 bg-[#0a0a0a] hover:border-white/20'}`}>
                                            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 ${billingCycle === 'MONTHLY' ? 'border-studio-neon bg-studio-neon shadow-[0_0_10px_#a6e22e]' : 'border-white/10'}`} />
                                            <span className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-[0.3em]">Monthly</span>
                                            <span className="block text-3xl font-black text-white font-mono">{currency === 'INR' ? `₹${item.price_inr}` : `$${item.price_usd}`}</span>
                                            <div className="mt-4 flex gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                                                {[1,2,3,4,5,6].map(i => <div key={i} className="h-1 w-4 bg-white/20 rounded-full" />)}
                                            </div>
                                        </button>
                                        <button onClick={() => setBillingCycle('ANNUAL')} className={`group relative p-8 border-2 rounded-2xl text-left transition-all overflow-hidden ${billingCycle === 'ANNUAL' ? 'border-studio-neon bg-[#151515] shadow-[0_0_40px_rgba(166,226,46,0.1)]' : 'border-white/5 bg-[#0a0a0a] hover:border-white/20'}`}>
                                            <div className="absolute top-4 right-12 px-2 py-0.5 bg-studio-neon text-black text-[9px] font-black uppercase rounded tracking-tighter z-10">{annualSavings}% SAVINGS</div>
                                            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 ${billingCycle === 'ANNUAL' ? 'border-studio-neon bg-studio-neon shadow-[0_0_10px_#a6e22e]' : 'border-white/10'}`} />
                                            <span className="block text-[10px] font-black text-white/30 mb-2 uppercase tracking-[0.3em]">Yearly</span>
                                            <span className="block text-3xl font-black text-white font-mono">{currency === 'INR' ? `₹${item.price_inr_annual}` : `$${item.price_usd_annual}`}</span>
                                            <div className="mt-4 flex gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                                                {[1,2,3,4,5,6].map(i => <div key={i} className="h-1 w-4 bg-white/20 rounded-full" />)}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6 relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-1 bg-studio-neon shadow-[0_0_15px_#a6e22e]" />
                                    <h2 className="text-2xl font-black uppercase tracking-[0.2em]">Shipping Address</h2>
                                </div>
                                <div className="bg-[#0a0a0a] border-2 border-white/5 p-10 rounded-3xl space-y-10 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5" />
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/5" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 relative group">
                                            <span className="absolute -top-3 left-4 px-2 bg-[#0a0a0a] text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within:text-studio-neon transition-colors">Full Name</span>
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-studio-neon transition-colors" size={18} />
                                            <input name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleInputChange} className="w-full bg-white/[0.01] border border-white/10 p-5 pl-14 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all font-mono" />
                                        </div>

                                        <div className="md:col-span-2 relative group">
                                            <span className="absolute -top-3 left-4 px-2 bg-[#0a0a0a] text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within:text-studio-neon transition-colors">Phone Number</span>
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-studio-neon transition-colors" size={18} />
                                            <input name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleInputChange} className="w-full bg-white/[0.01] border border-white/10 p-5 pl-14 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all font-mono" />
                                        </div>

                                        <div className="md:col-span-2 relative group">
                                            <span className="absolute -top-3 left-4 px-2 bg-[#0a0a0a] text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within:text-studio-neon transition-colors">Full Address</span>
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-studio-neon transition-colors" size={18} />
                                            <input name="address_line1" placeholder="Flat, Building, Area" value={formData.address_line1} onChange={handleInputChange} className="w-full bg-white/[0.01] border border-white/10 p-5 pl-14 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all font-mono" />
                                        </div>

                                        <div className="relative group">
                                            <input name="city" placeholder="Town / City" value={formData.city} onChange={handleInputChange} className="w-full bg-white/[0.01] border border-white/10 p-5 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all font-mono" />
                                        </div>
                                        
                                        <div className="relative group">
                                            <input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="w-full bg-white/[0.01] border border-white/10 p-5 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all font-mono" />
                                        </div>

                                        <div className="relative group">
                                            <input name="postal_code" placeholder="ZIP Code" value={formData.postal_code} onChange={handleInputChange} className="w-full bg-white/[0.01] border border-white/10 p-5 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all font-mono" />
                                        </div>
                                        
                                        <div className="p-5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black uppercase tracking-widest text-white/20 mb-1">REGION</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-studio-neon/80 flex items-center gap-2"><Globe size={10}/> {currency === 'INR' ? 'India' : 'International'}</span>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-studio-neon shadow-[0_0_10px_#a6e22e]" />
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5 my-8" />

                                    <div className="pt-4">
                                        {isFormValid ? (
                                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-8 bg-studio-neon rounded-full" />
                                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Payment Method</h3>
                                                    </div>
                                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">SECURE_SSL</span>
                                                </div>
                                                
                                                <div className="relative p-1 bg-white/5 rounded-2xl border border-white/10">
                                                    {currency === 'INR' ? (
                                                        <RazorpayCheckout 
                                                            itemId={mode === 'cart' ? items.map(i => i.id) : item?.id} 
                                                            mode={mode as any} 
                                                            planName={mode === 'cart' ? `${totalItems} Items` : `${item?.name} (${billingCycle})`} 
                                                            priceInr={finalPrice} 
                                                            interval={billingCycle}
                                                            onSuccess={async () => { 
                                                                await saveAddress(); 
                                                                const successUrl = mode === 'cart' 
                                                                    ? `/subscription/success?mode=cart&itemCount=${totalItems}`
                                                                    : `/subscription/success?mode=${mode}&itemId=${item?.id}&cycle=${billingCycle}`;
                                                                router.push(successUrl) 
                                                            }} 
                                                        />
                                                    ) : (
                                                        <PayPalCheckout 
                                                            itemId={mode === 'cart' ? items.map(i => i.id)[0] : item?.id} 
                                                            itemType={mode as any} 
                                                            planName={mode === 'cart' ? `${totalItems} Items` : `${item?.name} (${billingCycle})`} 
                                                            onSuccess={async () => { 
                                                                await saveAddress(); 
                                                                router.push(`/subscription/success?mode=${mode}&itemId=${item?.id}&cycle=${billingCycle}`) 
                                                            }} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group p-10 bg-black/40 border-2 border-dashed border-white/5 rounded-3xl text-center transition-all hover:border-white/10">
                                                <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <Loader2 className="text-white/20" size={24} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Enter address to pay</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 sticky top-32">
                    <div className="bg-[#0d0d0d] border-2 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                        <div className="p-10 border-b border-white/5 relative bg-[#111]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-studio-neon via-studio-neon/40 to-transparent opacity-30" />
                            {isTrialEligible && (
                                <div className="absolute top-6 right-6 bg-studio-neon text-black px-3 py-1 text-[9px] font-black uppercase rounded shadow-[0_0_15px_#a6e22e]">
                                    30-DAY TRIAL
                                </div>
                            )}
                             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-studio-neon animate-pulse" />
                                Order Summary
                             </h2>
                             <div className="relative aspect-square w-full mb-8 rounded-2xl overflow-hidden border border-white/10 bg-black/40 group-hover:border-studio-neon/30 transition-colors duration-500">
                                 {mode === 'cart' ? (
                                     <div className="absolute inset-0 flex items-center justify-center bg-studio-neon/5">
                                         <Disc size={48} className="text-studio-neon/20 animate-spin-slow" />
                                     </div>
                                 ) : (
                                     <Image 
                                         src={item?.cover_url || item?.image_url || (mode === 'subscription' ? '/images/subscription-hero.jpg' : mode === 'software' ? '/images/software-placeholder.jpg' : '/images/pack-placeholder.jpg')} 
                                         alt={item?.name || 'Item'} 
                                         fill
                                         className="object-cover transition-transform duration-700 group-hover:scale-110"
                                         priority
                                     />
                                 )}
                                 <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
                             </div>

                             <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">{mode === 'cart' ? 'Your Cart' : item?.name}</h3>
                             <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    {mode === 'cart' 
                                        ? `${totalItems} Items Selected`
                                        : mode === 'subscription' 
                                        ? `${billingCycle} Access`
                                        : 'Full Access'}
                                </span>
                             </div>
                         </div>

                         <div className="p-10 bg-black/40 space-y-8">
                             {mode === 'cart' ? (
                                 <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-3">
                                     {items.map(i => (
                                         <div key={i.id} className="group flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all gap-4">
                                             <div className="flex items-center gap-3">
                                                 <div className="h-10 w-10 relative rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                     <Image src={i.cover_url || '/images/pack-placeholder.jpg'} alt={i.name} fill className="object-cover" />
                                                 </div>
                                                 <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white/60 truncate max-w-[120px] uppercase tracking-wider">{i.name}</span>
                                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest italic">{i.type}</span>
                                                 </div>
                                             </div>
                                             <span className="text-xs font-black text-studio-neon font-mono">{currency === 'INR' ? `₹${i.price_inr}` : `$${i.price_usd}`}</span>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Type</span>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                            {mode === 'subscription' ? 'Plan' : mode === 'software' ? 'Software' : 'Sample Pack'}
                                        </span>
                                    </div>
                                    {(mode === 'subscription' || mode === 'pack') && (
                                        <div className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Credits</span>
                                            <span className="text-sm font-black text-studio-neon font-mono">{item?.credits}</span>
                                        </div>
                                    )}
                                 </div>
                             )}
                            
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-studio-neon transition-colors" size={14} />
                                        <input 
                                            placeholder="COUPON CODE"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="w-full bg-black/60 border border-white/10 p-4 pl-11 rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] focus:border-studio-neon outline-none text-white transition-all shadow-inner"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleApplyCoupon}
                                        disabled={loading || !couponCode}
                                        className="bg-white/5 hover:bg-studio-neon hover:text-black border border-white/10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white disabled:opacity-30"
                                    >
                                        APPLY
                                    </button>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex justify-between items-center bg-studio-neon/5 border border-studio-neon/20 px-4 py-3 rounded-xl animate-in zoom-in-95 duration-300">
                                        <span className="text-[9px] font-black text-studio-neon uppercase tracking-widest flex items-center gap-2">
                                            <Tag size={10} className="animate-bounce" /> 
                                            COUPON APPLIED
                                        </span>
                                        <span className="text-xs font-black text-studio-neon font-mono">
                                            {appliedDiscount.discountPercent ? `-${appliedDiscount.discountPercent}%` : `-${currency === 'INR' ? '₹' : '$'}${currency === 'INR' ? appliedDiscount.discountAmountInr : appliedDiscount.discountAmountUsd}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-studio-neon/60 uppercase tracking-[0.4em] mb-1">Total Amount</span>
                                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Inclusive of taxes</span>
                                    </div>
                                    <span className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                        {currency === 'INR' ? `₹${finalPrice}` : `$${finalPrice}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 text-center bg-black/60 border-t border-white/5">
                            <div className="flex items-center justify-center gap-4 text-white/10">
                                <div className="h-px w-8 bg-white/5" />
                                <ShieldCheck size={16} />
                                <span className="text-[9px] font-mono tracking-[0.4em] uppercase">SECURE PAYMENT</span>
                                <div className="h-px w-8 bg-white/5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
