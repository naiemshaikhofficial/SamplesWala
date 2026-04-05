import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * 🎰 SAMPLES WALA: MONTHLY CREDIT DROP CRON
 * This endpoint triggers the automated renewal of subscriptions
 * and grants fresh credits to all active users whose period has ended.
 */
export async function GET(req: Request) {
    // 🛡️ SECURITY: Only allow Vercel/Internal Croun to triggered
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized (Missing Security Token)', { status: 401 });
    }

    try {
        const supabase = await createClient();
        
        // 🚀 TRIGGER THE DATABASE RENEWAL ENGINE
        const { error } = await supabase.rpc('process_automated_renewals');

        if (error) {
            console.error('[CRON] Renewal RPC Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('[CRON] Automated renewals processed successfully at', new Date().toISOString());
        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
        console.error('[CRON] Renewal Exception:', err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
