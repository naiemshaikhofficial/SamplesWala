'use client'

import React, { useState } from 'react'
import Script from 'next/script'
import { createSubscription, purchaseCreditPack, purchaseSamplePack, purchaseSoftware, verifyPayment, purchaseCart, verifyCartPayment } from '@/app/subscription/actions'
import { useNotify } from '@/components/ui/NotificationProvider'
import { useCart } from '@/components/CartProvider'
import { triggerTrustpilotInvitation } from '@/lib/trustpilot'
import { Loader2, Zap } from 'lucide-react'

interface RazorpayCheckoutProps {
    itemId: string | string[]
    mode: 'subscription' | 'pack' | 'sample_pack' | 'software' | 'cart'
    planName: string
    priceInr: number
    interval?: 'MONTHLY' | 'ANNUAL'
    onSuccess?: (response: any) => void
}

export default function RazorpayCheckout({ itemId, mode, planName, priceInr, interval = 'MONTHLY', onSuccess }: RazorpayCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const { showToast } = useNotify()
    const { clearCart } = useCart()

    const handlePayment = async () => {
        setLoading(true)
        try {
            let action;
            if (mode === 'subscription') action = () => createSubscription(itemId as string, interval);
            else if (mode === 'pack') action = () => purchaseCreditPack(itemId as string);
            else if (mode === 'sample_pack') action = () => purchaseSamplePack(itemId as string);
            else if (mode === 'cart') action = () => purchaseCart(itemId as string[]);
            else action = () => purchaseSoftware(itemId as string);

            const { getDeviceFingerprint } = await import('@/lib/fingerprint')
            const deviceFingerprint = await getDeviceFingerprint()

            const orderData: any = await action()
            if (!orderData.success) {
                showToast(orderData.error || 'Identity Synchronization Failed', 'error')
                return
            }

            const options: any = {
                key: orderData.key,
                name: 'Samples Wala',
                description: orderData.isTrialLink 
                    ? `Free Trial · ₹5 refundable auth · Renews at ₹${orderData.planPrice}/mo` 
                    : `Order Confirmation: ${planName}`,
                handler: async function (response: any) {
                    let verified;
                    if (mode === 'cart') {
                        verified = await verifyCartPayment(response, orderData.orderId, itemId as string[])
                        if (verified.success) clearCart()
                    } else {
                        verified = await verifyPayment(response, orderData.subscriptionId || orderData.orderId, mode, itemId as string, interval)
                    }

                    if (verified.success) {
                        showToast(`SUCCESS: ACCESS GRANTED TO ${planName}.`, 'success')
                        
                        // 🛡️ BROWSER_DEVICE_LOCK
                        if (orderData.isTrialLink) {
                            localStorage.setItem('sw_trial_consumed_identity', 'true');
                        }

                        if (orderData.user) {
                            triggerTrustpilotInvitation(
                                orderData.user.email,
                                orderData.user.name,
                                orderData.subscriptionId || orderData.orderId
                            )
                        }

                        if (onSuccess) onSuccess(response)
                    }
                },
                prefill: {
                    name: orderData.user?.name || '',
                    email: orderData.user?.email || '',
                },
                theme: { color: '#a6e22e' },
            }

            if (orderData.isSubscription) {
                options.subscription_id = orderData.subscriptionId;
            } else {
                options.order_id = orderData.orderId;
                options.amount = orderData.amount;
                options.currency = 'INR';
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
            
        } catch (err: any) {
            showToast(err.message || 'Checkout failed.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-studio-neon text-black py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_30px_#a6e22e66] transition-all rounded-sm"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap size={18} />}
                <span>Pay</span>
            </button>
        </>
    )
}
