'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Loader2, Save, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/components/ui/NotificationProvider'

export function BillingSettings({ initialData, userId }: { initialData: any, userId: string }) {
    const [loading, setLoading] = useState(false)
    const [billing, setBilling] = useState({
        full_name: initialData?.full_name || '',
        address: initialData?.address_line1 || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        zip: initialData?.postal_code || '',
        pan: initialData?.pan_number || '',
        gstin: initialData?.gstin || ''
    })
    const { showToast } = useNotify()
    const supabase = createClient()

    const handleSave = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    full_name: billing.full_name,
                    address_line1: billing.address,
                    city: billing.city,
                    state: billing.state,
                    postal_code: billing.zip,
                    pan_number: billing.pan,
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
        <div className="space-y-8 p-10 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Billing & Compliance Signature</h3>
                   <p className="text-[9px] font-bold uppercase tracking-widest text-white/10 italic">Government GST Norms / KYC Metadata</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center border border-white/10 bg-white/5">
                    <MapPin className="h-4 w-4 text-white/40" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">Full Legal Name</label>
                    <input 
                        type="text" 
                        value={billing.full_name}
                        onChange={(e) => setBilling({...billing, full_name: e.target.value})}
                        className="w-full bg-black border border-white/10 h-12 px-4 text-[10px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                        placeholder="NAME ON GOVT ID"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">Street Address</label>
                    <input 
                        type="text" 
                        value={billing.address}
                        onChange={(e) => setBilling({...billing, address: e.target.value})}
                        className="w-full bg-black border border-white/10 h-12 px-4 text-[10px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                        placeholder="HOUSE / BUILDING / STREET"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">City</label>
                    <input 
                        type="text" 
                        value={billing.city}
                        onChange={(e) => setBilling({...billing, city: e.target.value})}
                        className="w-full bg-black border border-white/10 h-12 px-4 text-[10px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                        placeholder="CITY NAME"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">State / UT</label>
                    <input 
                        type="text" 
                        value={billing.state}
                        onChange={(e) => setBilling({...billing, state: e.target.value})}
                        className="w-full bg-black border border-white/10 h-12 px-4 text-[10px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                        placeholder="INDIAN STATE / UT"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">Postal Code (ZIP)</label>
                    <input 
                        type="text" 
                        value={billing.zip}
                        onChange={(e) => setBilling({...billing, zip: e.target.value})}
                        className="w-full bg-black border border-white/10 h-12 px-4 text-[10px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                        placeholder="Pincode"
                    />
                </div>
                <div className="space-y-1 opacity-60">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">GSTIN / PAN (Optional)</label>
                    <input 
                        type="text" 
                        value={billing.gstin}
                        onChange={(e) => setBilling({...billing, gstin: e.target.value})}
                        className="w-full bg-black border border-white/10 h-12 px-4 text-[10px] font-black uppercase text-white tracking-widest focus:border-studio-yellow focus:outline-none"
                        placeholder="BUSINESS GSTIN"
                    />
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full h-14 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:invert transition-all"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? 'SECURING SIGNATURE...' : 'SAVE BILLING SIGNATURE'}
            </button>
        </div>
    )
}
