import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * 🛰️ SIGNAL_PURGE (V5_CRON)
 * Deletes all expired or used secure download tokens.
 * Recommended to run every 1-4 hours via Vercel Cron or GitHub Actions.
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized Pulse', { status: 401 });
    }

    try {
        const admin = getAdminClient();
        
        // Protocol: Delete tokens that have been used or are past expiration
        const { count, error } = await admin
            .from('secure_download_tokens')
            .delete()
            .or(`used_at.not.is.null,expires_at.lt.${new Date().toISOString()}`);

        if (error) throw error;

        console.log(`[CLEANUP_CRON] Registry Purged: ${count} stale tokens removed.`);
        
        return NextResponse.json({ 
            signal: 'Cleaned', 
            purgedCount: count,
            timestamp: new Date().toISOString()
        });

    } catch (e: any) {
        console.error("[CLEANUP_CRON_FAULT]", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
