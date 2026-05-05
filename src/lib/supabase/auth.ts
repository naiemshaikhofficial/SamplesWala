import { cache } from 'react'
import { createClient } from './server'
import { getAdminClient } from './admin'
import { unstable_cache } from 'next/cache'
import { isUserAdmin } from '../utils/admin'

/**
 * 🛡️ USER_SUBSCRIPTION_CACHE
 * Caches the subscription status of a user for 1 hour.
 * Keyed by userId to ensure data isolation.
 */
export const getCachedUserSubscription = unstable_cache(
    async (userId: string) => {
        const adminClient = getAdminClient()
        const { data: account } = await adminClient
            .from('user_accounts')
            .select('subscription_status, plan_id')
            .eq('user_id', userId)
            .maybeSingle()
        
        return !!(account?.plan_id && account.subscription_status !== 'INACTIVE')
    },
    ['user-subscription-status-v3'],
    { revalidate: 3600, tags: ['user-subscription-status'] }
)

/**
 * 🧬 SECURE_SERVER_AUTH_BRIDGE
 * The single source of truth for user identification on the server.
 * Uses React 'cache' to ensure it only runs once per request.
 * 
 * Security Note: Uses supabase.auth.getUser() to verify the JWT signal.
 */
export const getServerAuth = cache(async () => {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) return { user: null, isSubscribed: false, isAdmin: false }

        const isAdmin = isUserAdmin(user)
        
        // Admins are always treated as subscribed
        if (isAdmin) return { user, isSubscribed: true, isAdmin: true }

        // Fetch subscription status with cross-request caching
        const isSubscribed = await getCachedUserSubscription(user.id)
        
        return { user, isSubscribed, isAdmin: false }
    } catch (err) {
        console.error('[AUTH_BRIDGE_CRITICAL_FAILURE]', err)
        return { user: null, isSubscribed: false, isAdmin: false }
    }
})
