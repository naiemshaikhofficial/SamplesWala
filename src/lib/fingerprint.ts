/**
 * 🎨 CORE_DEVICE_FINGERPRINT (V1)
 * Generates a unique hash for the physical device using Canvas & Hardware Specs.
 * This distinguishes between identical Samsung models with high precision.
 */
export async function getDeviceFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return 'unknown';

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'canvas-blocked';

        // 🧬 1. Canvas Ghost Rendering
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = "#069";
        ctx.fillText("SamplesWala_Fraud_Shield_🧬", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("SamplesWala_Fraud_Shield_🧬", 4, 17);
        
        const canvasData = canvas.toDataURL();

        // 🧬 2. Hardware Signal Batching
        const hardwareSignal = [
            navigator.userAgent,
            navigator.language,
            window.screen.colorDepth,
            window.screen.width + "x" + window.screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown',
            (navigator as any).deviceMemory || 'unknown',
            canvasData.length // The size of the rendered image is a fingerprint itself
        ].join('||');

        // 🧬 3. Cryptographic Hashing (Simple SHA-256 equivalent for identity)
        const encoder = new TextEncoder();
        const data = encoder.encode(hardwareSignal + canvasData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    } catch (e) {
        console.error("Fingerprint Forge Failed:", e);
        return 'forge-failure-' + Math.random();
    }
}
