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
        
        // Protocol 1: Delete tokens that have been used or are past expiration
        const { data: staleTokens, error: fetchError } = await admin
            .from('secure_download_tokens')
            .select('item_id, item_type')
            .or(`used_at.not.is.null,expires_at.lt.${new Date().toISOString()}`);

        const { count, error } = await admin
            .from('secure_download_tokens')
            .delete()
            .or(`used_at.not.is.null,expires_at.lt.${new Date().toISOString()}`);

        if (error) throw error;

        // Protocol 2: Harden the Library (Reset recently accessed files to Restricted)
        if (staleTokens && staleTokens.length > 0) {
            const { restrictFileAccess } = await import('@/lib/drive/automation');
            
            // Get unique item_ids to avoid redundant API calls
            const uniqueItemIds = Array.from(new Set(staleTokens.map(t => t.item_id)));
            
            for (const itemId of uniqueItemIds) {
                // Explicitly type to avoid "referenced in own initializer" build error
                const targetItem: any = (staleTokens as any[]).find((t: any) => t.item_id === itemId);
                if (!targetItem) continue;

                const table = targetItem.item_type === 'sample' ? 'samples' : 'sample_packs';
                const col = targetItem.item_type === 'sample' ? 'download_url' : 'full_pack_download_url';
                
                const { data: item } = await admin.from(table).select(col).eq('id', itemId).single();
                const driveId = (item as any)?.[col]?.match(/[-\w]{25,}/)?.[0];
                
                if (driveId) {
                    await restrictFileAccess(driveId);
                }
            }
        }

        console.log(`[CLEANUP_CRON] Registry Purged: ${count} stale tokens removed. Library hardened.`);
        
        return NextResponse.json({ 
            signal: 'Cleaned & Hardened', 
            purgedCount: count,
            timestamp: new Date().toISOString()
        });

    } catch (e: any) {
        console.error("[CLEANUP_CRON_FAULT]", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
