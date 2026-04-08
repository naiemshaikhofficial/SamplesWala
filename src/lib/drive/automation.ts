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

        /** 🧬 ANONYMOUS_LINK_PROTOCOL: Use 'anyone' with 'view' role **/
        console.log(`[DRIVE_AUTH_V5] Setting Public-Link access for: ${itemName}`);
        
        await drive.permissions.create({
            fileId: driveId,
            sendNotificationEmail: false,
            requestBody: {
                role: 'reader',
                type: 'anyone', // 🔥 No individual emails in the list!
            }
        });

        console.log(`\x1b[32m[DRIVE_PUBLIC_SYNCED]\x1b[0m ${itemName} is now available via Stealth Link.`);
        
        return { success: true, driveId };

    } catch (err: any) {
        console.error("[DRIVE_ENGINE_FAULT]", err.message)
        return { error: 'Engine Fault', details: err.message }
    }
}

/**
 * 🔒 Security Harden: Reset a file to 'Restricted' mode.
 */
export async function restrictFileAccess(driveId: string) {
    try {
        const drive = getDriveClient();
        const { data: permissions } = await drive.permissions.list({ fileId: driveId });
        
        // Find the 'anyone' permission and delete it
        const anyonePermission = permissions.permissions?.find(p => p.type === 'anyone');
        if (anyonePermission?.id) {
            await drive.permissions.delete({
                fileId: driveId,
                permissionId: anyonePermission.id
            });
            console.log(`[DRIVE_HARDENED] File ${driveId} is now RESTRICTED.`);
        }
    } catch (err: any) {
        console.error("[DRIVE_HARDEN_FAULT]", err.message);
    }
}
