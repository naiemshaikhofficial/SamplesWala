import crypto from 'crypto';

/**
 * 🛰️ SIGNAL_ENCRYPTION_ENGINE :: SAMPLES_WALA V11
 * Uses AES-256-GCM to securely sign and encrypt sensitive Drive IDs for client-side batching.
 * This prevents manual DB lookups during audio playback.
 */

const PROXY_SECRET = process.env.PROXY_SECRET || 'samples-wala-secure-fallback';

/**
 * Extracts the Google Drive file ID from a variety of URL formats.
 * Centralized here to ensure consistency across the proxy and signal generator.
 */
export function getDriveFileId(url: string | undefined | null): string | null {
  if (!url) return null;
  // Patterns: /file/d/[ID], ?id=[ID], &id=[ID], /uc?id=[ID]
  const regex = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:.+?\/)*(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
/**
 * Encrypts a Drive File ID into a time-limited Secure Signal.
 * @param driveId The Google Drive File ID
 * @param name The Sample Name for branding
 * @returns An encrypted string payload (iv:encrypted:tag)
 */
export function generateAudioSignal(driveId: string | null | undefined, name: string = 'Preview'): string | null {
    if (!driveId || typeof window !== 'undefined') return null; // Server-only protocol
    
    try {
        const secretHash = crypto.createHash('sha256').update(PROXY_SECRET).digest();
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', secretHash, iv);
        
        // 🔒 Expiry: 24 Hours
        const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        const payload = JSON.stringify({ id: driveId, name, exp });
        
        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        
        return `${iv.toString('hex')}:${encrypted}:${authTag}`;
    } catch (e) {
        console.error("[SIGNAL_GEN_ERROR]", e);
        return null;
    }
}

/**
 * Decrypts a Secure Signal and verifies its integrity and timestamp.
 */
export function decodeAudioSignal(signal: string | null | undefined): { id: string, name: string } | null {
    if (!signal) return null;
    
    try {
        const parts = signal.split(':');
        if (parts.length !== 3) return null;
        const [ivHex, encrypted, authTag] = parts;

        const secretHash = crypto.createHash('sha256').update(PROXY_SECRET).digest();
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', secretHash, iv);
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        const data = JSON.parse(decrypted);
        
        // 🕒 Verify Expiry
        if (Math.floor(Date.now() / 1000) > data.exp) {
            console.warn("[SIGNAL_EXPIRED]");
            return null;
        }
        
        return { id: data.id, name: data.name };
    } catch (e) {
        // Silently fail for malformed signals
        return null;
    }
}
