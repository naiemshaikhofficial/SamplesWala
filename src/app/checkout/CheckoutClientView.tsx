'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, User, Package, CreditCard, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Globe, IndianRupee, Activity } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import RazorpayCheckout from '../../components/payment/RazorpayCheckout'
import PayPalCheckout from '../../components/payment/PayPalCheckout'
import { createClient } from '@/lib/supabase/client'

interface CheckoutClientViewProps {
    item: any
    mode: string
    user: any
    profile: any
}

export default function CheckoutClientView({ item, mode, user, profile }: CheckoutClientViewProps) {
    const [currency, setCurrency] = React.useState<'INR' | 'USD'>('INR')
    React.useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) setCurrency('INR')
        else setCurrency('USD')
    }, [])

    const router = useRouter()
    const { showToast } = useNotify()
    const [loading, setLoading] = useState(false)
    const [gateway, setGateway] = useState<'RAZORPAY' | 'PAYPAL'>('RAZORPAY')
    React.useEffect(() => {
        setGateway(currency === 'INR' ? 'RAZORPAY' : 'PAYPAL')
    }, [currency])

    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY')
    const [step, setStep] = useState(user ? 2 : 1)
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    // 🧬 TRIAL_LOGIC: Match with actions.ts Starter plan logic
    const isTrialEligible = item.name === 'Starter' && (!profile?.is_trial_used && profile?.subscription_status !== 'ACTIVE')
    
    // Calculate Pricing Constants
    const annualSavings = Math.round(((item.price_inr * 12) - item.price_inr_annual) / (item.price_inr * 12) * 100)
    const currentPriceInr = billingCycle === 'MONTHLY' ? item.price_inr : item.price_inr_annual
    const currentPriceUsd = billingCycle === 'MONTHLY' ? item.price_usd : item.price_usd_annual

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        address_line1: profile?.address_line1 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        postal_code: profile?.postal_code || '',
        country: profile?.country || (currency === 'INR' ? 'India' : '')
    })

    const handleGoogleAuth = async () => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=/checkout` }
        })
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const supabase = createClient()
        let res;
        if (authMode === 'SIGNUP') res = await supabase.auth.signUp({ email, password })
        else res = await supabase.auth.signInWithPassword({ email, password })

        setLoading(false)
        if (res.error) showToast(res.error.message, 'error')
        else {
            showToast(authMode === 'SIGNUP' ? 'Account Created.' : 'Welcome Back.', 'success')
            router.refresh()
            setStep(2)
        }
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

    return (
        <div className="container mx-auto px-4 max-w-7xl">
            {/* 🏁 PROGRESS_FLOW_INDICATOR */}
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
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 max-w-lg mx-auto w-full">
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-center">Join Samples Wala</h2>
                            
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl shadow-2xl space-y-8">
                                <button 
                                    onClick={handleGoogleAuth}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-xl"
                                >
                                    <svg height="20" viewBox="0 0 24 24" width="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.49 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                    Continue with Google
                                </button>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/5"></div>
                                    <span className="flex-shrink mx-4 text-white/20 text-xs font-bold uppercase tracking-widest">or email</span>
                                    <div className="flex-grow border-t border-white/5"></div>
                                </div>

                                <form onSubmit={handleAuth} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                                        <button type="button" onClick={() => setAuthMode('SIGNUP')} className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'SIGNUP' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>Sign Up</button>
                                        <button type="button" onClick={() => setAuthMode('LOGIN')} className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'LOGIN' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>Login</button>
                                    </div>

                                    <div className="space-y-4">
                                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" required />
                                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" required />
                                    </div>

                                    <button disabled={loading} className="w-full bg-studio-neon text-black py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_#a6e22e33]">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={16} />}
                                        {authMode === 'SIGNUP' ? 'Create Account' : 'Login Now'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {step >= 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
                            {mode === 'subscription' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Select Plan Period</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button onClick={() => setBillingCycle('MONTHLY')} className={`p-6 border-2 rounded-xl text-left transition-all ${billingCycle === 'MONTHLY' ? 'border-studio-neon bg-studio-neon/5' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                                            <span className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-widest">Monthly Cycle</span>
                                            <span className="block text-2xl font-black text-white">{currency === 'INR' ? `₹${item.price_inr}` : `$${item.price_usd}`}</span>
                                        </button>
                                        <button onClick={() => setBillingCycle('ANNUAL')} className={`p-6 border-2 rounded-xl text-left transition-all relative ${billingCycle === 'ANNUAL' ? 'border-studio-neon bg-studio-neon/5' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-studio-neon text-black text-[9px] font-black uppercase rounded-md tracking-tighter">{annualSavings}% SAVINGS</div>
                                            <span className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-widest">Yearly Cycle</span>
                                            <span className="block text-2xl font-black text-white">{currency === 'INR' ? `₹${item.price_inr_annual}` : `$${item.price_usd_annual}`}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Shipping Information</h2>
                                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* 🏷️ FULL_NAME */}
                                        <div className="md:col-span-2 relative group">
                                            <User className="absolute left-4 top-4 text-white/20 group-focus-within:text-studio-neon transition-colors" size={18} />
                                            <input name="full_name" placeholder="Enter Full Name" value={formData.full_name} onChange={handleInputChange} className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" />
                                        </div>

                                        {/* 📞 PHONE */}
                                        <div className="md:col-span-2 relative group">
                                            <Phone className="absolute left-4 top-4 text-white/20 group-focus-within:text-studio-neon transition-colors" size={18} />
                                            <input name="phone_number" placeholder="Enter Phone Number" value={formData.phone_number} onChange={handleInputChange} className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" />
                                        </div>

                                        {/* 📍 ADDRESS */}
                                        <div className="md:col-span-2 relative group">
                                            <MapPin className="absolute left-4 top-4 text-white/20 group-focus-within:text-studio-neon transition-colors" size={18} />
                                            <input name="address_line1" placeholder="Flat, House no., Building, Company" value={formData.address_line1} onChange={handleInputChange} className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" />
                                        </div>

                                        {/* 🏙️ CITY */}
                                        <input name="city" placeholder="Town / City" value={formData.city} onChange={handleInputChange} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" />
                                        
                                        {/* 🗺️ STATE */}
                                        <input name="state" placeholder="State/Province" value={formData.state} onChange={handleInputChange} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" />

                                        {/* 🔢 ZIP */}
                                        <input name="postal_code" placeholder="PIN / ZIP Code" value={formData.postal_code} onChange={handleInputChange} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-sm focus:border-studio-neon outline-none text-white transition-all focus:bg-white/[0.05]" />
                                        
                                        {/* 🌍 REGION_INDICATOR */}
                                        <div className="p-4 bg-white/5 border border-white/20 rounded-xl flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2"><Globe size={12}/> Region Status</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-studio-neon">{currency === 'INR' ? 'India' : 'International'}</span>
                                        </div>
                                    </div>

                                <div className="h-px bg-white/5" />

                                <div className="pt-2">
                                    {isFormValid ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-studio-neon mb-2">
                                                <CreditCard size={14} />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Payment Terminal Unlock</h3>
                                            </div>
                                            {currency === 'INR' ? (
                                                <RazorpayCheckout 
                                                    itemId={item.id} 
                                                    mode={mode as any} 
                                                    planName={`${item.name} (${billingCycle})`} 
                                                    priceInr={isTrialEligible ? 5 : currentPriceInr} 
                                                    onSuccess={async () => { await saveAddress(); router.push('/browse') }} 
                                                />
                                            ) : (
                                                <PayPalCheckout 
                                                    itemId={item.id} 
                                                    itemType={mode as any} 
                                                    planName={`${item.name} (${billingCycle})`} 
                                                    onSuccess={async () => { await saveAddress(); router.push('/browse') }} 
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-[0.4em] text-center text-white/20 italic">Complete form to initialize terminal...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                <div className="lg:col-span-4 sticky top-32">
                    <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/10 relative">
                            {isTrialEligible && (
                                <div className="absolute top-4 right-4 bg-studio-neon/10 border border-studio-neon/30 px-3 py-1 text-studio-neon text-[9px] font-bold uppercase rounded-full">
                                    Trial Active
                                </div>
                            )}
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2"><Activity size={14} className="text-studio-neon" /> Order Summary</h2>
                            <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{item.name}</h3>
                            <p className="text-xs text-white/30">{billingCycle === 'MONTHLY' ? 'Monthly Plan' : 'Annual Plan (Best Value)'}</p>
                        </div>
                        <div className="p-8 bg-black/20 space-y-5">
                            <div className="flex justify-between text-xs font-bold text-white/40"><span>Pack Credits</span><span className="text-white">{item.credits}</span></div>
                            <div className="flex justify-between text-xs font-bold text-white/40"><span>Plan Duration</span><span className="text-white">{billingCycle}</span></div>
                            {isTrialEligible && (
                                <div className="flex justify-between text-xs font-bold text-studio-neon">
                                    <span>Trial Auth Fee</span>
                                    <span>{currency === 'INR' ? '₹5' : '$0'}</span>
                                </div>
                            )}
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-studio-neon uppercase tracking-widest">Total Price</span>
                                <span className="text-4xl font-black text-white tracking-tighter">
                                    {isTrialEligible 
                                        ? (currency === 'INR' ? '₹5' : '$0') 
                                        : (currency === 'INR' ? `₹${currentPriceInr}` : `$${currentPriceUsd}`)
                                    }
                                </span>
                            </div>
                            {isTrialEligible && (
                                <p className="text-[10px] text-white/20 italic leading-relaxed">Regular price starts after 30-day trial.</p>
                            )}
                        </div>
                        <div className="p-6 text-center space-y-4"><div className="flex items-center justify-center gap-3 text-white/20"><ShieldCheck size={14} /><span className="text-[10px] font-bold tracking-widest uppercase">SSL Protected</span></div></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
