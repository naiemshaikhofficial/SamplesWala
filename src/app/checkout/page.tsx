import { getServerAuth } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import CheckoutClientView from '@/app/checkout/CheckoutClientView'

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ planId?: string, packId?: string, mode: string }> }) {
    const params = await searchParams
    const { planId, packId, mode } = params
    
    const { user } = await getServerAuth()
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    let itemDetails = null

    if (mode === 'subscription' && planId) {
        const { data } = await supabase.from('subscription_plans').select('*').eq('id', planId).single()
        itemDetails = data
    } else if (mode === 'pack' && packId) {
        const { data } = await supabase.from('credit_packs').select('*').eq('id', packId).single()
        itemDetails = data
    } else if (mode === 'sample_pack' && packId) {
        const { data } = await supabase.from('sample_packs').select('*').eq('id', packId).single()
        itemDetails = data
    }

    if (!itemDetails) {
        redirect('/subscription')
    }

    // Fetch user profile for initial address values if user exists
    let profile = null
    if (user) {
        const { data } = await supabase.from('user_accounts').select('*').eq('user_id', user.id).single()
        profile = data
    }

    // ⛔ ENFORCE: No Credits without Active Subscription
    if (mode === 'pack' && (!profile || profile.subscription_status !== 'ACTIVE')) {
        redirect('/subscription?error=subscription_required')
    }

    return (
        <main className="min-h-screen pt-32 pb-20 bg-black">
            <CheckoutClientView 
                item={itemDetails} 
                mode={mode} 
                user={user}
                profile={profile}
            />
        </main>
    )
}
