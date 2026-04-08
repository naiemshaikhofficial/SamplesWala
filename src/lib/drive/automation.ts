/** 🔌 SAMPLES_WALA :: DRIVE_AUTOMATION_ENGINE (V5_NEW_AUTH) **/

import { getAdminClient } from '@/lib/supabase/admin'
import { google } from 'googleapis'

/**
 * 🛰️ MASTER DRIVE HUB
 * Switched to GoogleAuth class for more robust Service Account handling.
 * This should resolve the 'Missing API Key' issue by forcing a Bearer Token.
 */

export function getDriveClient() {
    const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
        throw new Error("Google Drive Configuration Missing in .env.local");
    }

    // 🔑 NEW_AUTH_PROTOCOL: Using the official GoogleAuth helper
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: SERVICE_ACCOUNT_EMAIL,
            private_key: SERVICE_ACCOUNT_PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    console.log(`[DRIVE_AUTH_V5] Client Generated for: ${SERVICE_ACCOUNT_EMAIL}`);

    return google.drive({ version: 'v3', auth });
}

/**
 * 🧬 Grant automated 'Reader' access to a customer's email.
 */
export async function grantDrivePermission(userEmail: string, itemId: string, isPack: boolean = false) {
    const adminClient = getAdminClient()

    try {
        const drive = getDriveClient();
        console.log(`[DRIVE_SYNC_INIT] Identifying target for ${userEmail}...`)

        // 1. Fetch the artifact URL
        let downloadUrl: string | null = null;
        let itemName: string | null = null;

        if (isPack) {
            const { data: pack } = await adminClient
                .from('sample_packs')
                .select('full_pack_download_url, name')
                .eq('id', itemId)
                .single()
            downloadUrl = pack?.full_pack_download_url || null;
            itemName = pack?.name || null;
        } else {
            const { data: sample } = await adminClient
                .from('samples')
                .select('download_url, name')
                .eq('id', itemId)
                .single()
            downloadUrl = sample?.download_url || null;
            itemName = sample?.name || null;
        }

        if (!downloadUrl) return { error: 'Signal Missing' };

        // 2. Resolve Drive ID
        const driveId = downloadUrl.match(/[-\w]{25,}/)?.[0]
        if (!driveId) {
            console.log("[DRIVE_BYPASS] Not a Google Drive link, automation not required.")
            return { success: true, bypassed: true };
        }

        /** 📠 LIVE SIGNAL TRANSMISSION **/
        console.log(`[DRIVE_AUTH_V5] Syncing permission for: ${userEmail}`);
        
        await drive.permissions.create({
            fileId: driveId,
            sendNotificationEmail: false,
            requestBody: {
                role: 'reader',
                type: 'user',
                emailAddress: userEmail
            }
        });

        console.log(`\x1b[32m[DRIVE_ACCESS_SYNCED]\x1b[0m ${userEmail} synchronized with ${itemName}`);
        
        return { success: true, driveId, userEmail };

    } catch (err: any) {
        console.error("[DRIVE_ENGINE_FAULT]", err.message)
        return { error: 'Engine Fault', details: err.message }
    }
}
