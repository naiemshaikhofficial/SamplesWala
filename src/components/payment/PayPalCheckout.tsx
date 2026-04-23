'use client'

import React from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { createPayPalOrder, capturePayPalOrder } from '@/app/subscription/actions'
import { useRouter } from 'next/navigation'
import { useNotify } from '@/components/ui/NotificationProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { triggerTrustpilotInvitation } from '@/lib/trustpilot'

interface PayPalCheckoutProps {
    itemId: string
    itemType: 'subscription' | 'pack' | 'sample_pack' | 'software'
    planName: string
    onSuccess?: () => void
}

export default function PayPalCheckout({ itemId, itemType, planName, onSuccess }: PayPalCheckoutProps) {
    const router = useRouter()
    const { showToast } = useNotify()
    const { user } = useAuth()

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "USD",
        intent: "capture",
    }

    return (
        <div className="w-full mt-4">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ 
                        layout: 'horizontal',
                        color: 'gold',
                        shape: 'rect',
                        label: 'checkout',
                        tagline: false
                    }}
                    createOrder={async () => {
                        try {
                            const res = await createPayPalOrder(itemId, itemType)
                            if (res.success) return res.orderId
                            throw new Error(res.error || 'Identity Synchronization Failed')
                        } catch (err: any) {
                            showToast(err.message, 'error')
                            return ''
                        }
                    }}
                    onApprove={async (data) => {
                        try {
                            const res = await capturePayPalOrder(data.orderID, itemId, itemType)
                            if (res.success) {
                                showToast(`${planName} linked to your node via PayPal.`, 'success')
                                
                                // 🌠 Trigger Trustpilot Invitation Signal
                                if (user) {
                                    triggerTrustpilotInvitation(
                                        user.email!,
                                        user.user_metadata?.full_name || 'Producer',
                                        data.orderID
                                    )
                                }

                                if (onSuccess) onSuccess()
                                router.push('/browse')
                            }
                        } catch (err: any) {
                            showToast(err.message, 'error')
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Script Error:", err)
                        showToast("PayPal failed to load. Check your connection.", 'error')
                    }}
                />
            </PayPalScriptProvider>
        </div>
    )
}
