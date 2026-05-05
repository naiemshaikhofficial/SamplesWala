import { getServerAuth } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import CheckoutClientView from '@/app/checkout/CheckoutClientView'

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ planId?: string, packId?: string, mode: 'subscription' | 'pack' | 'cart' | 'sample_pack' | 'software', currency?: 'INR' | 'USD' }> }) {
    const params = await searchParams
    const { planId, packId, mode, currency = 'INR' } = params
    
    const { user } = await getServerAuth()
    const { createClient } = await import('@/lib/supabase/server')
    const { getAdminClient } = await import('@/lib/supabase/admin')
    const supabase = await createClient()
    const adminClient = getAdminClient()

    let itemDetails = null
    // 🧬 ROBUST_ID_ACQUISITION: Fallback between planId and packId for resilience
    const targetId = packId || planId

    if (mode === 'cart') {
        // In cart mode, details are managed on client side via CartProvider
        itemDetails = { name: 'Cart Checkout' }
    } else if (mode === 'subscription' && targetId) {
        const { data } = await adminClient.from('subscription_plans').select('*').eq('id', targetId).single()
        itemDetails = data
    } else if (mode === 'pack' && targetId) {
        const { data } = await adminClient.from('credit_packs').select('*').eq('id', targetId).single()
        itemDetails = data
    } else if (mode === 'sample_pack' && targetId) {
        const { data } = await adminClient.from('sample_packs').select('*').eq('id', targetId).single()
        itemDetails = data
    } else if (mode === 'software' && targetId) {
        const { data } = await adminClient.from('software_products').select('*').eq('id', targetId).single()
        itemDetails = data
    }

    if (!itemDetails && mode !== 'cart') {
        console.error('[CHECKOUT_RECOVERY] Item details missing for:', { mode, targetId })
        redirect('/subscription')
    }

    // Fetch user profile for initial address values if user exists
    let profile = null
    if (user) {
        const { data } = await supabase.from('user_accounts').select('*').eq('user_id', user.id).single()
        profile = data
    }

    // ⛔ ENFORCE: No restriction for direct purchases (Sample Packs, Software, Credit Packs)
    // removed subscription requirement for mode === 'pack' per user request

    return (
        <main className="min-h-screen pt-32 pb-20 bg-black">
            <CheckoutClientView 
                item={itemDetails} 
                mode={mode} 
                currency={currency}
                initialUser={user}
                initialProfile={profile}
            />
        </main>
    )
}
