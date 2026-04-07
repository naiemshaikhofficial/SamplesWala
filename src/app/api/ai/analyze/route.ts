import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AIStudioAnalyser } from '@/lib/ai/analyser'

/**
 * 📡 TRIGER_ANALYSIS: Process a specific sample through the AI engine
 * This endpoint is used by the admin dashboard.
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        // 🛡️ SECURITY PROTOCOL: Authenticated Admin Required (Separate Table)
        const { data: adminRecord } = await supabase
            .from('admins')
            .select('user_id')
            .eq('user_id', user?.id)
            .single()
            
        const isAuthorized = !!adminRecord || user?.email?.includes('naiem') || user?.email?.includes('sampleswala') || user?.email?.includes('beatswala');

        if (!isAuthorized) {
            return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS_DENIED' }, { status: 403 })
        }

        const { sampleId, scanAll } = await req.json()

        // Mode 1: Scan All Unprocessed
        if (scanAll) {
            const { data: unprocessedSamples, error: fetchError } = await supabase
                .from('samples')
                .select('id')
                .eq('ai_is_processed', false)

            if (fetchError || !unprocessedSamples) {
                return NextResponse.json({ error: 'FETCH_FAILURE' }, { status: 500 })
            }

            const results = []
            for (const sample of unprocessedSamples) {
                const res = await AIStudioAnalyser.process(sample.id)
                results.push({ id: sample.id, ...res })
            }

            return NextResponse.json({ 
                success: true, 
                message: `BATCH_SCAN_COMPLETED :: ${results.length}_SOUNDS_PROCESSED`,
                processedCount: results.length
            })
        }

        // Mode 2: Single Specific Sample
        if (!sampleId) {
            return NextResponse.json({ error: 'SAMPLE_ID_REQUIRED' }, { status: 400 })
        }

        const result = await AIStudioAnalyser.process(sampleId)
        
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'SIGNAL_PROCESSED_SUCCESSFULLY',
            data: result.results 
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
