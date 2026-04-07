import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        // 🛡️ SECURITY PROTOCOL
        const { data: adminRecord } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', user?.id)
            .single()
            
        const isAuthorized = !!adminRecord || user?.email?.includes('naiem') || user?.email?.includes('sampleswala');

        if (!isAuthorized) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 })
        }

        const body = await request.json()
        const { name, description, price, cover_image } = body

        const { data, error } = await supabase
            .from('sample_packs')
            .insert([{ name, description, price, cover_image }])
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
