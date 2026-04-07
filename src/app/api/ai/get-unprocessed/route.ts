import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * 📡 GET_UNPROCESSED: Returns a list of sample IDs that haven't been processed by AI
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        // 🛡️ SECURITY PROTOCOL: Authenticated Admin Required
        const { data: adminRecord } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', user?.id)
            .single()
            
        const isAuthorized = !!adminRecord || user?.email?.includes('naiem') || user?.email?.includes('sampleswala') || user?.email?.includes('beatswala');

        if (!isAuthorized) {
            return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS_DENIED' }, { status: 403 })
        }

        const { data: unprocessedSamples, error: fetchError } = await supabase
            .from('samples')
            .select('id')
            .eq('ai_is_processed', false)

        if (fetchError) throw fetchError

        return NextResponse.json({ 
            success: true, 
            data: unprocessedSamples || []
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
