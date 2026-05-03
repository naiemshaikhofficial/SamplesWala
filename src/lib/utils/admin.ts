import { User } from '@supabase/supabase-js'

/**
 * 🛡️ CENTRAL_ADMIN_AUTHORITY
 * Single source of truth for administrative privilege checks.
 */
export function isUserAdmin(user: User | null | undefined): boolean {
    if (!user || !user.email) return false;
    
    const email = user.email.toLowerCase();
    const adminEmails = [
        'naiemshaikh@gmail.com',
        'naiemshaikhofficial@gmail.com',
        'sampleswala@gmail.com',
        'naiem@sampleswala.com'
    ];

    // Check exact match or domain match
    return adminEmails.includes(email) || email.endsWith('@sampleswala.com');
}
