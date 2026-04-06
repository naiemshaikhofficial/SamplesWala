'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Loader2, Save, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/components/ui/NotificationProvider'

export function BillingSettings({ initialData, userId }: { initialData: any, userId: string }) {
    const [loading, setLoading] = useState(false)
    const [billing, setBilling] = useState({
        full_name: initialData?.full_name || '',
        phone: initialData?.phone_number || '',
        address: initialData?.address_line1 || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        zip: initialData?.postal_code || '',
        gstin: initialData?.gstin || ''
    })
    const { showToast } = useNotify()
    const supabase = createClient()

    const handleSave = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('user_accounts')
                .update({
                    full_name: billing.full_name,
                    phone_number: billing.phone,
                    address_line1: billing.address,
                    city: billing.city,
                    state: billing.state,
                    postal_code: billing.zip,
                    gstin: billing.gstin
                })
                .eq('user_id', userId)

            if (error) throw error

            // 🧬 EDGE SYNC: Update local storage for checkout speed
            localStorage.setItem(`billing_${userId}`, JSON.stringify(billing))
            
            showToast('BILLING ARTIFACTS SECURED', 'success')
        } catch (e: any) {
            showToast(e.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 p-6 md:p-10 border border-white/10 bg-black/40 studio-panel rounded-sm shadow-2xl relative overflow-hidden group">
            {/* 💎 STUDIO DECOR */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <MapPin className="h-32 w-32" />
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-6 relative z-10">
                <div>
                   <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-studio-neon mb-1">Billing_Information</h3>
                   <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 italic">For Secure Checkout & Universal Receipts</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center bg-black border border-white/10 text-white/20">
                    <ShieldCheck className="h-4 w-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">Full Legal Name</label>
                    <input 
                        type="text" 
                        value={billing.full_name}
                        onChange={(e) => setBilling({...billing, full_name: e.target.value.toUpperCase()})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="ENTER YOUR FULL NAME"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">Street Address</label>
                    <input 
                        type="text" 
                        value={billing.address}
                        onChange={(e) => setBilling({...billing, address: e.target.value.toUpperCase()})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="HOUSE / BUILDING / STREET NAME"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">City</label>
                    <input 
                        type="text" 
                        value={billing.city}
                        onChange={(e) => setBilling({...billing, city: e.target.value.toUpperCase()})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="CITY NAME"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">State / Territory</label>
                    <input 
                        type="text" 
                        value={billing.state}
                        onChange={(e) => setBilling({...billing, state: e.target.value.toUpperCase()})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="ENTER STATE / UT"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">Pincode (ZIP)</label>
                    <input 
                        type="text" 
                        value={billing.zip}
                        onChange={(e) => setBilling({...billing, zip: e.target.value})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="6-DIGIT CODE"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">Mobile Phone Number</label>
                    <input 
                        type="text" 
                        value={billing.phone}
                        onChange={(e) => setBilling({...billing, phone: e.target.value})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="+91 00000 00000"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block ml-1">GSTIN / TAX_ID (Optional)</label>
                    <input 
                        type="text" 
                        value={billing.gstin}
                        onChange={(e) => setBilling({...billing, gstin: e.target.value.toUpperCase()})}
                        className="w-full bg-[#111] border border-white/5 h-14 px-6 text-[11px] font-black uppercase text-white tracking-widest focus:border-studio-neon focus:bg-black focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="BUSINESS GSTIN"
                    />
                </div>
            </div>

            <div className="pt-6 relative z-10">
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full h-16 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-studio-neon transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-r-[12px] border-studio-yellow group/btn"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover/btn:scale-125 transition-transform" />}
                    {loading ? 'SYNCHRONIZING...' : 'SAVE BILLING INFO'}
                </button>
            </div>
        </div>
    )
}
