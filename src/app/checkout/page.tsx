import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CheckoutClientView from './CheckoutClientView'

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ planId?: string, packId?: string, mode: string }> }) {
    const params = await searchParams
    const { planId, packId, mode } = params
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let itemDetails = null

    if (mode === 'subscription' && planId) {
        const { data } = await supabase.from('subscription_plans').select('*').eq('id', planId).single()
        itemDetails = data
    } else if (mode === 'pack' && packId) {
        const { data } = await supabase.from('credit_packs').select('*').eq('id', packId).single()
        itemDetails = data
    }

    if (!itemDetails) {
        redirect('/pricing')
    }

    // Fetch user profile for initial address values
    const { data: profile } = await supabase.from('user_accounts').select('*').eq('id', user.id).single()

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
